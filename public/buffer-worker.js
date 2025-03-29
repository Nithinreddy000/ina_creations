// Inspired by ServiceWorkerFullVideoBuffer: https://github.com/titoBouzout/ServiceWorkerFullVideoBuffer
// This service worker ensures videos are fully buffered to prevent buffering issues

// Configuration
const CACHE_NAME = 'video-buffer-cache-v1';
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.m4v', '.ogg'];
const DEBUG = true;
const MAX_PARALLEL_REQUESTS = 4;
const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks for faster loading

// Setup a Map to store video buffers for active videos
const videoBuffers = new Map();

// Default options
let bufferOptions = {
  aggressiveCaching: true,
  prefetchAmount: 100, // Prefetch 100% by default for zero buffering
  chunkSize: CHUNK_SIZE,
  parallelRequests: MAX_PARALLEL_REQUESTS,
  preloadMetadata: true
};

// Helper for logging with timestamps
const log = (...args) => {
  if (!DEBUG) return;
  console.log(`[VideoBufferSW] [${new Date().toISOString()}]`, ...args);
};

// Helper to check if a URL is a video
const isVideoUrl = (url) => {
  if (!url) return false;
  return VIDEO_EXTENSIONS.some(ext => url.toLowerCase().endsWith(ext));
};

// Install event - set up cache
self.addEventListener('install', event => {
  log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      log('Cache opened');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => {
            log(`Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      );
    }).then(() => {
      log('Service Worker now active');
      return self.clients.claim();
    })
  );
});

// Parse Range header
const parseRange = (rangeHeader) => {
  if (!rangeHeader) return null;
  
  const matches = rangeHeader.match(/bytes=(\d+)-(\d*)/);
  if (!matches) return null;
  
  return {
    start: parseInt(matches[1], 10),
    end: matches[2] ? parseInt(matches[2], 10) : undefined
  };
};

// Handle video request - serve from cache or network
const handleVideoRequest = async (request, clientId) => {
  const url = request.url;
  
  // Check if we have this video in our data buffer
  const cachedBuffer = videoBuffers.get(url);
  
  if (cachedBuffer) {
    log(`Serving video from memory buffer: ${url}`);
    
    // Handle range requests
    const range = parseRange(request.headers.get('Range'));
    if (range) {
      log(`Range request: ${range.start}-${range.end || 'end'}`);
      
      const start = range.start;
      const end = range.end !== undefined ? range.end : cachedBuffer.byteLength - 1;
      const slicedBuffer = cachedBuffer.slice(start, end + 1);
      
      return new Response(slicedBuffer, {
        status: 206,
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Range': `bytes ${start}-${end}/${cachedBuffer.byteLength}`,
          'Content-Length': slicedBuffer.byteLength.toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'max-age=31536000',
        }
      });
    }
    
    // Non-range request - serve entire video
    return new Response(cachedBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': cachedBuffer.byteLength.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'max-age=31536000',
      }
    });
  }
  
  // If not in memory buffer, check the cache
  const cacheResponse = await caches.match(url);
  
  if (cacheResponse) {
    log(`Serving video from cache: ${url}`);
    return cacheResponse;
  }
  
  // Not cached or buffered - fetch from network
  log(`Fetching video from network: ${url}`);
  
  try {
    // Fetch the video
    const response = await fetch(request.clone());
    
    // Only cache successful responses
    if (!response || !response.ok) {
      log(`Error fetching video: ${response.status}`);
      return response;
    }
    
    // If this is a range request, don't cache it
    if (response.status === 206) {
      log('Not caching range response');
      return response;
    }
    
    // Clone response for caching
    const clonedResponse = response.clone();
    
    // Store in cache
    const cache = await caches.open(CACHE_NAME);
    cache.put(url, clonedResponse);
    
    // Also trigger buffering in the background if not already
    if (!videoBuffers.has(url)) {
      log(`Starting background buffer for: ${url}`);
      bufferVideo(url, clientId).catch(err => {
        log(`Background buffering error: ${err.message}`);
      });
    }
    
    return response;
  } catch (error) {
    log(`Network fetch error: ${error.message}`);
    return new Response('Network error', { status: 500 });
  }
};

// Main fetch handler
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = request.url;
  
  // Only intercept GET requests for videos
  if (request.method !== 'GET' || !isVideoUrl(url)) {
    return;
  }
  
  log(`Intercepted fetch for video: ${url}`);
  
  // Get client ID for messaging
  const clientId = event.clientId;
  
  event.respondWith(handleVideoRequest(request, clientId));
});

// Buffer a video fully and store in memory
const bufferVideo = async (url, clientId) => {
  // Don't re-buffer videos that are already in progress or completed
  if (videoBuffers.has(url)) {
    log(`Video already buffered or buffering: ${url}`);
    return;
  }
  
  try {
    log(`Starting to buffer video: ${url}`);
    
    // Notify client we're starting
    if (clientId) {
      const client = await self.clients.get(clientId);
      if (client) {
        client.postMessage({
          type: 'bufferStatus',
          url: url,
          buffered: 0,
          done: false,
          error: null
        });
      }
    }
    
    // Fetch the complete video
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Cache-Control': 'max-age=31536000'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.status}`);
    }
    
    // Get total size for progress calculation
    const contentLength = parseInt(response.headers.get('Content-Length') || '0', 10);
    log(`Video size: ${contentLength} bytes`);
    
    // Read the response as arrayBuffer
    const reader = response.body.getReader();
    
    // Track download progress
    let receivedLength = 0;
    let chunks = [];
    let startTime = Date.now();
    let lastReportTime = startTime;
    
    // Read stream chunks
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        log(`Download complete: ${url}`);
        break;
      }
      
      chunks.push(value);
      receivedLength += value.length;
      
      // Calculate progress
      const progress = contentLength ? Math.round((receivedLength / contentLength) * 100) : 0;
      
      // Calculate download speed (every 500ms)
      const now = Date.now();
      let speed = null;
      
      if (now - lastReportTime >= 500) {
        // Calculate MB per second
        const elapsedSeconds = (now - startTime) / 1000;
        const downloadedMB = receivedLength / (1024 * 1024);
        speed = (downloadedMB / elapsedSeconds).toFixed(2);
        lastReportTime = now;
        
        // Send progress update to client
        if (clientId) {
          try {
            const client = await self.clients.get(clientId);
            if (client) {
              client.postMessage({
                type: 'bufferStatus',
                url: url,
                buffered: progress,
                speed: `${speed}`,
                done: false,
                error: null
              });
            }
          } catch (e) {
            log(`Error sending progress update: ${e.message}`);
          }
        }
      }
    }
    
    // Concatenate chunks into single buffer
    let resultArrayBuffer;
    if (chunks.length === 1) {
      // Only one chunk, use it directly
      resultArrayBuffer = chunks[0];
    } else {
      // Multiple chunks, concatenate them
      resultArrayBuffer = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        resultArrayBuffer.set(chunk, position);
        position += chunk.length;
      }
    }
    
    // Store the buffer
    videoBuffers.set(url, resultArrayBuffer);
    
    // Store in cache as well for persistence
    const cache = await caches.open(CACHE_NAME);
    await cache.put(url, new Response(resultArrayBuffer.slice(0), {
      headers: response.headers
    }));
    
    log(`Successfully buffered full video: ${url}`);
    
    // Notify client we're done
    if (clientId) {
      try {
        const client = await self.clients.get(clientId);
        if (client) {
          client.postMessage({
            type: 'bufferStatus',
            url: url,
            buffered: 100,
            done: true,
            error: null
          });
        }
      } catch (e) {
        log(`Error sending completion update: ${e.message}`);
      }
    }
    
    // Broadcast to all clients
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'bufferComplete',
          url: url
        });
      });
    });
    
    return resultArrayBuffer;
  } catch (error) {
    log(`Error buffering video: ${error.message}`);
    
    // Notify client about error
    if (clientId) {
      try {
        const client = await self.clients.get(clientId);
        if (client) {
          client.postMessage({
            type: 'bufferStatus',
            url: url,
            buffered: 0,
            done: false,
            error: error.message
          });
        }
      } catch (e) {
        log(`Error sending error update: ${e.message}`);
      }
    }
    
    throw error;
  }
};

// Handle messages from clients
self.addEventListener('message', event => {
  const { type, url, clientId } = event.data;
  
  if (type === 'bufferVideo' && url) {
    log(`Received request to buffer video: ${url}`);
    
    bufferVideo(url, clientId || event.source.id)
      .then(() => {
        log(`Successfully buffered video: ${url}`);
      })
      .catch(error => {
        log(`Error in bufferVideo handler: ${error.message}`);
      });
  }
  
  if (type === 'clearBuffer' && url) {
    if (videoBuffers.has(url)) {
      videoBuffers.delete(url);
      log(`Cleared buffer for: ${url}`);
    }
  }
  
  if (type === 'isBuffered' && url) {
    const isBuffered = videoBuffers.has(url);
    log(`Check if buffered: ${url} - ${isBuffered}`);
    
    if (event.source) {
      event.source.postMessage({
        type: 'isBufferedResult',
        url: url,
        isBuffered: isBuffered
      });
    }
  }

  // Handle buffer options updates
  if (type === 'SET_BUFFER_OPTIONS') {
    log('Updating buffer options: ' + JSON.stringify(event.data.options));
    bufferOptions = {
      ...bufferOptions,
      ...event.data.options
    };
    
    // Respond to confirm options were set
    if (event.source) {
      event.source.postMessage({
        type: 'BUFFER_OPTIONS_SET',
        options: bufferOptions
      });
    }
  }
  
  // Handle video buffer request
  if (type === 'BUFFER_VIDEO') {
    const { url, priority } = event.data;
    log(`Received request to buffer video: ${url}`);
    
    // Store client to send progress updates
    const client = event.source;
    
    // Start buffering immediately
    bufferVideoWithProgress(url, client, priority);
  }
});

// Handle range requests for videos (important for seeking)
async function handleRangeRequest(request) {
  log(`Handling range request: ${request.url}`);
  
  try {
    // Always fetch from network for range requests, which is needed for seeking
    const response = await fetch(request);
    log('Not caching range response');
    return response;
  } catch (error) {
    log(`Range request fetch error: ${error}`);
    
    // Try to get from cache as fallback
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      log('Returning cached range response');
      return cachedResponse;
    }
    
    // If not in cache, make a non-range request to network
    const fullRequest = new Request(request.url, {
      method: request.method,
      headers: new Headers(request.headers),
      mode: request.mode,
      credentials: request.credentials,
      redirect: request.redirect,
    });
    
    // Remove range header
    fullRequest.headers.delete('range');
    
    const fullResponse = await fetch(fullRequest);
    log('Returning full response for range request');
    return fullResponse;
  }
}

// Handle full video requests with our enhanced buffering
async function handleFullVideoRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    log(`Serving video from cache: ${request.url}`);
    // Before returning cached response, start background refresh
    if (bufferOptions.aggressiveCaching) {
      refreshCachedVideo(request.url, cache);
    }
    return cachedResponse;
  }
  
  log(`Fetching video from network: ${request.url}`);
  
  try {
    // Fetch the video and cache it
    const response = await fetch(request);
    
    // Clone the response to cache it and return it
    const clonedResponse = response.clone();
    
    // Cache the video even if not explicitly requested for buffering
    cache.put(request, clonedResponse);
    
    return response;
  } catch (error) {
    log(`Error fetching video: ${error}`);
    throw error;
  }
}

// Refresh a cached video in the background
async function refreshCachedVideo(url, cache) {
  try {
    log(`Background refreshing cached video: ${url}`);
    const request = new Request(url);
    const freshResponse = await fetch(request);
    await cache.put(request, freshResponse);
    log(`Successfully refreshed video cache for: ${url}`);
  } catch (error) {
    log(`Failed to refresh video cache: ${error}`);
  }
}

// Buffer a video with progress reporting
async function bufferVideoWithProgress(url, client, priority = false) {
  log(`Starting to buffer video: ${url}`);
  
  try {
    // First, get the content length with a HEAD request
    const headRequest = new Request(url, { method: 'HEAD' });
    const headResponse = await fetch(headRequest);
    const contentLength = parseInt(headResponse.headers.get('content-length') || '0');
    
    if (contentLength) {
      log(`Video size: ${contentLength} bytes`);
    } else {
      log('Could not determine video size');
    }

    // Open the cache
    const cache = await caches.open(CACHE_NAME);
    
    // Check if video is already in the cache
    const cachedResponse = await cache.match(url);
    if (cachedResponse) {
      // If already cached, check if fully cached
      const cachedClone = cachedResponse.clone();
      const cachedBlob = await cachedClone.blob();
      
      if (cachedBlob.size >= contentLength && contentLength > 0) {
        log(`Video already fully cached: ${url}`);
        
        // Notify client of 100% buffering
        if (client) {
          client.postMessage({
            type: 'BUFFER_PROGRESS',
            url,
            buffered: 100,
            done: true,
            speed: 0
          });
        }
        
        return;
      }
      
      log(`Video partially cached (${cachedBlob.size}/${contentLength} bytes), continuing...`);
    }
    
    // Begin buffering the video
    log(`Aggressive buffering of video: ${url}`);
    
    // Number of chunks to buffer in parallel
    const parallelRequests = priority ? 
      bufferOptions.parallelRequests || MAX_PARALLEL_REQUESTS : 
      Math.min(2, bufferOptions.parallelRequests || MAX_PARALLEL_REQUESTS);
    
    // Amount to prefetch (priority videos get full prefetch)
    const prefetchAmount = priority ? 
      100 : // Always buffer 100% for priority videos
      (bufferOptions.prefetchAmount || 100);
    
    // Chunk size based on options
    const chunkSize = bufferOptions.chunkSize || CHUNK_SIZE;
    
    // Determine the total number of chunks
    const totalChunks = Math.ceil(contentLength / chunkSize);
    
    // Calculate how many chunks to prefetch based on prefetchAmount percentage
    const chunksToFetch = Math.min(
      totalChunks,
      Math.ceil((prefetchAmount / 100) * totalChunks)
    );
    
    // Track the buffer progress
    let bufferedChunks = 0;
    let bufferedBytes = 0;
    let lastProgressUpdate = Date.now();
    let lastBufferPercentage = 0;
    
    // Create a Response object to cache as we build it
    let combinedResponse = null;
    let combinedBlob = null;
    
    // Function to update buffer progress
    const updateProgress = (newBytes, bytesPerSecond) => {
      bufferedBytes += newBytes;
      const percentage = Math.min(100, Math.round((bufferedBytes / contentLength) * 100));
      
      // Only send updates when progress increases or every 1 second
      const now = Date.now();
      if (percentage > lastBufferPercentage || (now - lastProgressUpdate) > 1000) {
        if (client) {
          client.postMessage({
            type: 'BUFFER_PROGRESS',
            url,
            buffered: percentage,
            done: percentage >= 100,
            speed: bytesPerSecond ? (bytesPerSecond / (1024 * 1024)).toFixed(2) : 0
          });
        }
        lastProgressUpdate = now;
        lastBufferPercentage = percentage;
      }
    };
    
    // Buffer the video in chunks
    for (let chunkIndex = 0; chunkIndex < chunksToFetch; chunkIndex += parallelRequests) {
      // Calculate range for each parallel request
      const chunkPromises = [];
      
      for (let i = 0; i < parallelRequests && (chunkIndex + i) < chunksToFetch; i++) {
        const start = (chunkIndex + i) * chunkSize;
        const end = Math.min(start + chunkSize - 1, contentLength - 1);
        
        // If we already have this chunk cached, skip it
        if (cachedResponse && await isRangeCached(cache, url, start, end)) {
          bufferedChunks++;
          updateProgress(end - start + 1);
          continue;
        }
        
        // Otherwise fetch the chunk
        const fetchStartTime = Date.now();
        const rangeRequest = new Request(url, {
          headers: new Headers({
            'Range': `bytes=${start}-${end}`
          })
        });
        
        const chunkPromise = fetch(rangeRequest)
          .then(async (response) => {
            const fetchTime = Date.now() - fetchStartTime;
            const chunkSize = end - start + 1;
            const bytesPerSecond = fetchTime > 0 ? (chunkSize / (fetchTime / 1000)) : 0;
            
            // Cache the chunk
            await cache.put(rangeRequest, response.clone());
            
            // Update progress
            bufferedChunks++;
            updateProgress(chunkSize, bytesPerSecond);
            
            return response;
          })
          .catch(error => {
            log(`Error fetching chunk ${chunkIndex + i}: ${error}`);
          });
        
        chunkPromises.push(chunkPromise);
      }
      
      // Wait for all parallel chunks to complete
      await Promise.all(chunkPromises);
      
      // If buffering was canceled, stop
      if (client && !client.id) {
        log(`Buffering canceled for: ${url}`);
        break;
      }
    }
    
    // Final progress update
    if (client) {
      const finalPercentage = Math.min(100, Math.round((bufferedBytes / contentLength) * 100));
      client.postMessage({
        type: 'BUFFER_PROGRESS',
        url,
        buffered: finalPercentage,
        done: finalPercentage >= 100,
        speed: 0
      });
    }
    
    log(`Completed buffering for: ${url}`);
  } catch (error) {
    log(`Error during video buffering: ${error}`);
    
    // Notify client of error
    if (client) {
      client.postMessage({
        type: 'BUFFER_ERROR',
        url,
        error: error.message
      });
    }
  }
}

// Check if a specific range is already cached
async function isRangeCached(cache, url, start, end) {
  try {
    const rangeRequest = new Request(url, {
      headers: new Headers({
        'Range': `bytes=${start}-${end}`
      })
    });
    
    const cachedResponse = await cache.match(rangeRequest);
    return !!cachedResponse;
  } catch (error) {
    log(`Error checking range cache: ${error}`);
    return false;
  }
} 