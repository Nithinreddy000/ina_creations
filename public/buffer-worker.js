// Inspired by ServiceWorkerFullVideoBuffer: https://github.com/titoBouzout/ServiceWorkerFullVideoBuffer
// This service worker ensures videos are fully buffered to prevent buffering issues

// Configuration
const CACHE_NAME = 'video-buffer-cache-v1';
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.m4v', '.ogg'];
const DEBUG = true;

// Setup a Map to store video buffers for active videos
const videoBuffers = new Map();

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
}); 