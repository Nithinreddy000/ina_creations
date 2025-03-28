/**
 * Video Buffer Client
 * Manages service worker registration and handles video buffering
 */
(function() {
  const DEBUG = true;
  
  // Helper for logging
  const log = (...args) => {
    if (!DEBUG) return;
    console.log('[VideoBuffer]', ...args);
  };
  
  // Main VideoBuffer class
  class VideoBuffer {
    constructor() {
      this.swRegistration = null;
      this.activeBuffering = new Map();
      this.bufferCallbacks = new Map();
      this.isInitialized = false;
      this.bufferIndicators = new Map();
      this.videoObserver = null;
      
      this.initialize();
    }
    
    // Initialize service worker
    async initialize() {
      if ('serviceWorker' in navigator) {
        try {
          // Register service worker
          this.swRegistration = await navigator.serviceWorker.register('/buffer-worker.js', {
            scope: '/'
          });
          
          log('Service worker registered:', this.swRegistration);
          
          // Wait for service worker to be active
          if (this.swRegistration.installing) {
            await new Promise(resolve => {
              this.swRegistration.installing.addEventListener('statechange', e => {
                if (e.target.state === 'activated') {
                  resolve();
                }
              });
            });
          }
          
          // Set up message listener for service worker
          navigator.serviceWorker.addEventListener('message', this.handleWorkerMessage.bind(this));
          
          this.isInitialized = true;
          
          // Setup observer for video elements
          this.setupVideoObserver();
          
          // Scan for existing videos
          this.scanForVideos();
          
          log('Video buffer system initialized');
        } catch (error) {
          log('Service worker registration failed:', error);
        }
      } else {
        log('Service workers not supported in this browser');
      }
    }
    
    // Handle messages from service worker
    handleWorkerMessage(event) {
      const { type, url, buffered, done, error, speed } = event.data;
      
      if (type === 'bufferStatus') {
        // Update buffer status
        log(`Buffer status for ${url}: ${buffered}%${done ? ' (complete)' : ''}${error ? ` (error: ${error})` : ''}`);
        
        // Call any registered callbacks for this URL
        if (this.bufferCallbacks.has(url)) {
          const callbacks = this.bufferCallbacks.get(url);
          callbacks.forEach(callback => {
            try {
              callback({
                url,
                buffered,
                done,
                error,
                speed
              });
            } catch (e) {
              log('Error in buffer callback:', e);
            }
          });
          
          // If done or error, remove callbacks
          if (done || error) {
            this.bufferCallbacks.delete(url);
          }
        }
        
        // Update active buffering state
        if (done) {
          this.activeBuffering.delete(url);
        } else if (!error) {
          this.activeBuffering.set(url, buffered);
        }
        
        // Update visual indicator if it exists
        this.updateBufferIndicator(url, buffered, done, error);
      }
      
      if (type === 'bufferComplete') {
        log(`Buffer complete for ${url}`);
        this.activeBuffering.delete(url);
        
        // Find videos using this URL and update their state
        document.querySelectorAll('video').forEach(video => {
          if (video.src === url && !video.hasAttribute('data-buffer-complete')) {
            video.setAttribute('data-buffer-complete', 'true');
            log(`Marked video as buffer complete:`, video);
          }
        });
      }
      
      if (type === 'isBufferedResult') {
        log(`Is buffered check result for ${url}: ${event.data.isBuffered}`);
      }
    }
    
    // Buffer a video
    async bufferVideo(url, callback) {
      if (!this.isInitialized) {
        await this.waitForInitialization();
      }
      
      // Skip if already buffering or URL is invalid
      if (!url || this.activeBuffering.has(url)) {
        if (callback && this.activeBuffering.has(url)) {
          // Add callback to existing process
          if (!this.bufferCallbacks.has(url)) {
            this.bufferCallbacks.set(url, []);
          }
          this.bufferCallbacks.get(url).push(callback);
        }
        return;
      }
      
      log(`Starting to buffer video: ${url}`);
      
      // Mark as active buffering
      this.activeBuffering.set(url, 0);
      
      // Register callback if provided
      if (callback) {
        if (!this.bufferCallbacks.has(url)) {
          this.bufferCallbacks.set(url, []);
        }
        this.bufferCallbacks.get(url).push(callback);
      }
      
      // Create buffer indicator
      this.createBufferIndicator(url);
      
      try {
        // Send message to service worker
        await this.sendMessageToSW({
          type: 'bufferVideo',
          url: url,
          clientId: null
        });
        
        log(`Buffer request sent for: ${url}`);
      } catch (error) {
        log(`Error requesting buffer: ${error.message}`);
        
        // Call callback with error
        if (callback) {
          callback({
            url,
            buffered: 0,
            done: false,
            error: error.message
          });
        }
        
        // Remove from active buffering
        this.activeBuffering.delete(url);
      }
    }
    
    // Cancel buffering a video
    async cancelBuffering(url) {
      if (!this.isInitialized || !url) return;
      
      log(`Cancelling buffer for: ${url}`);
      
      try {
        // Send cancel message to service worker
        await this.sendMessageToSW({
          type: 'clearBuffer',
          url: url
        });
        
        // Clear local state
        this.activeBuffering.delete(url);
        this.bufferCallbacks.delete(url);
        
        // Remove buffer indicator
        this.removeBufferIndicator(url);
        
        log(`Cancelled buffer for: ${url}`);
      } catch (error) {
        log(`Error cancelling buffer: ${error.message}`);
      }
    }
    
    // Check if a video is buffered
    async isBuffered(url) {
      if (!this.isInitialized || !url) return false;
      
      // If actively buffering, return false
      if (this.activeBuffering.has(url)) {
        return false;
      }
      
      try {
        // Ask service worker if URL is buffered
        await this.sendMessageToSW({
          type: 'isBuffered',
          url: url
        });
        
        // Result will come back via message event
        return new Promise(resolve => {
          const handleMessage = event => {
            if (event.data.type === 'isBufferedResult' && event.data.url === url) {
              navigator.serviceWorker.removeEventListener('message', handleMessage);
              resolve(event.data.isBuffered);
            }
          };
          
          // Set timeout to avoid hanging
          const timeout = setTimeout(() => {
            navigator.serviceWorker.removeEventListener('message', handleMessage);
            resolve(false);
          }, 1000);
          
          // Listen for response
          navigator.serviceWorker.addEventListener('message', handleMessage);
        });
      } catch (error) {
        log(`Error checking buffer status: ${error.message}`);
        return false;
      }
    }
    
    // Helper to send message to service worker
    async sendMessageToSW(message) {
      if (!this.isInitialized) {
        await this.waitForInitialization();
      }
      
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(message);
      } else {
        throw new Error('No active service worker');
      }
    }
    
    // Wait for initialization to complete
    async waitForInitialization() {
      if (this.isInitialized) return;
      
      return new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (this.isInitialized) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve();
        }, 5000);
      });
    }
    
    // Create visual buffer indicator
    createBufferIndicator(url) {
      // Skip if already exists
      if (this.bufferIndicators.has(url)) return;
      
      // Find video elements with this URL
      document.querySelectorAll('video').forEach(video => {
        if (video.src === url) {
          const container = video.parentElement;
          if (!container) return;
          
          // Create indicator element
          const indicator = document.createElement('div');
          indicator.className = 'video-buffer-indicator';
          indicator.style.position = 'absolute';
          indicator.style.bottom = '0';
          indicator.style.left = '0';
          indicator.style.width = '0%';
          indicator.style.height = '4px';
          indicator.style.backgroundColor = '#3984ff';
          indicator.style.transition = 'width 0.3s ease';
          indicator.style.zIndex = '10';
          
          // Add to container and map
          container.style.position = 'relative';
          container.appendChild(indicator);
          this.bufferIndicators.set(url, indicator);
        }
      });
    }
    
    // Update buffer indicator
    updateBufferIndicator(url, progress, done, error) {
      const indicator = this.bufferIndicators.get(url);
      if (!indicator) return;
      
      // Update progress
      indicator.style.width = `${progress}%`;
      
      if (done) {
        // Fade out when complete
        indicator.style.opacity = '0';
        setTimeout(() => {
          if (indicator.parentElement) {
            indicator.parentElement.removeChild(indicator);
          }
          this.bufferIndicators.delete(url);
        }, 500);
      } else if (error) {
        // Show error state
        indicator.style.backgroundColor = '#ff3939';
      }
    }
    
    // Remove buffer indicator
    removeBufferIndicator(url) {
      const indicator = this.bufferIndicators.get(url);
      if (!indicator) return;
      
      if (indicator.parentElement) {
        indicator.parentElement.removeChild(indicator);
      }
      
      this.bufferIndicators.delete(url);
    }
    
    // Setup observer for video elements
    setupVideoObserver() {
      if (!('IntersectionObserver' in window)) return;
      
      // Disconnect existing observer if any
      if (this.videoObserver) {
        this.videoObserver.disconnect();
      }
      
      // Create new observer
      this.videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const video = entry.target;
          if (entry.isIntersecting && video.src && !video.hasAttribute('data-buffer-initiated')) {
            video.setAttribute('data-buffer-initiated', 'true');
            
            // Start buffering this video
            this.bufferVideo(video.src);
          }
        });
      }, {
        rootMargin: '200px', // Start buffering when video is 200px from viewport
        threshold: 0
      });
      
      // Scan for videos to observe
      this.scanForVideos();
    }
    
    // Scan the page for videos to observe
    scanForVideos() {
      if (!this.videoObserver) return;
      
      // Find all videos with data-buffer attribute
      document.querySelectorAll('video[data-buffer="true"]').forEach(video => {
        if (!video.hasAttribute('data-buffer-observed')) {
          video.setAttribute('data-buffer-observed', 'true');
          this.videoObserver.observe(video);
          log('Observing video for buffering:', video.src);
        }
      });
    }
  }
  
  // Create global instance
  const videoBufferInstance = new VideoBuffer();
  
  // Expose public methods
  window.bufferVideo = (url, callback) => videoBufferInstance.bufferVideo(url, callback);
  window.cancelBuffering = (url) => videoBufferInstance.cancelBuffering(url);
  window.isVideoBuffered = (url) => videoBufferInstance.isBuffered(url);
  
  // Scan for videos periodically
  setInterval(() => {
    videoBufferInstance.scanForVideos();
  }, 2000);
  
  // Expose API for debugging
  window.videoBufferAPI = videoBufferInstance;
  
  log('Video Buffer Client loaded');
})(); 