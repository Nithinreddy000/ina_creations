import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPortfolioItems } from '../utils/firebase';
import { FaExpand, FaVolumeMute, FaVolumeUp, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import OptimizedVideo from './OptimizedVideo';

// Constants for buffer detection debounce times
const WAITING_DEBOUNCE_TIME = 200;
const PLAYING_DEBOUNCE_TIME = 50;

// Custom hook for checking if element is visible
const useIsVisible = (options = {}, defaultValue = false) => {
  const [isVisible, setIsVisible] = useState(defaultValue);
  const targetRef = useRef(null);

  useEffect(() => {
    if (!targetRef.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    observer.observe(targetRef.current);

    return () => {
      if (targetRef.current) {
        observer.unobserve(targetRef.current);
      }
    };
  }, [options]);

  return { isVisible, targetRef };
};

// Custom hook for video buffer management - YouTube style
const useVideoBuffer = () => {
  // Store buffer data for each video
  const bufferData = useRef({});
  
  // Function to start buffering a video completely
  const startBuffering = useCallback((videoElement, videoId) => {
    if (!videoElement || bufferData.current[videoId]?.isBuffering) return;
    
    // Set buffering status
    bufferData.current[videoId] = {
      isBuffering: true,
      progress: 0,
      startTime: Date.now()
    };
    
    // Set preload to auto to trigger full loading
    videoElement.preload = 'auto';
    
    // Force load to start buffer downloading
    if (videoElement.readyState === 0) {
      videoElement.load();
    }
    
    // Start a background fetch request for the video to prime the browser cache
    if ('fetch' in window) {
      fetch(videoElement.src, { 
        method: 'GET',
        headers: { 'Range': 'bytes=0-' },
        mode: 'cors',
        credentials: 'same-origin',
        cache: 'force-cache'
      }).catch(e => console.log('Background fetch error:', e));
    }
    
    // Listen for buffer progress
    const updateBufferProgress = () => {
      if (!videoElement || !bufferData.current[videoId]) return;
      
      const buffered = videoElement.buffered;
      if (buffered.length > 0) {
        // Get the end of the largest buffered range
        const bufferedEnd = buffered.end(buffered.length - 1);
        const duration = videoElement.duration || 1;
        const progress = Math.min(100, Math.round((bufferedEnd / duration) * 100));
        
        bufferData.current[videoId].progress = progress;
        
        // When buffer reaches 100%, mark as fully buffered
        if (progress >= 100) {
          bufferData.current[videoId].isFullyBuffered = true;
          videoElement.removeEventListener('progress', updateBufferProgress);
        }
      }
    };
    
    videoElement.addEventListener('progress', updateBufferProgress);
    
    // Return cleanup function
    return () => {
      videoElement.removeEventListener('progress', updateBufferProgress);
      if (bufferData.current[videoId]) {
        bufferData.current[videoId].isBuffering = false;
      }
    };
  }, []);
  
  // Get buffer status for a video
  const getBufferStatus = useCallback((videoId) => {
    return bufferData.current[videoId] || { isBuffering: false, progress: 0, isFullyBuffered: false };
  }, []);
  
  return { startBuffering, getBufferStatus };
};

const Portfolio = () => {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoTimes, setVideoTimes] = useState({});
  const [showDetails, setShowDetails] = useState({});
  const [stoppedVideos, setStoppedVideos] = useState({});
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const [showControls, setShowControls] = useState({});
  const [showFullVideoOption, setShowFullVideoOption] = useState({});
  const [visibleVideos, setVisibleVideos] = useState({});
  const videoRefs = useRef({});
  const observerRefs = useRef({});
  const isMobile = window.innerWidth <= 768;
  const [showAll, setShowAll] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoStates, setVideoStates] = useState({});
  const [bufferStates, setBufferStates] = useState({});
  const { startBuffering, getBufferStatus } = useVideoBuffer();
  const timeCheckIntervals = useRef({});
  
  // Add debounce timeout refs
  const waitingTimeouts = useRef({});
  const playingTimeouts = useRef({});

  // Add a throttle utility for buffer updates
  const throttleTimeouts = useRef({});
  
  const throttleBufferUpdate = useCallback((id, callback, delay = 1000) => {
    if (throttleTimeouts.current[id]) {
      return false;
    }
    
    throttleTimeouts.current[id] = setTimeout(() => {
      throttleTimeouts.current[id] = null;
    }, delay);
    
    callback();
    return true;
  }, []);

  // Register service worker for video buffering with enhanced aggressive caching
  useEffect(() => {
    // Load buffer client script
    const scriptElement = document.createElement('script');
    scriptElement.src = '/buffer-client.js';
    scriptElement.async = true;
    scriptElement.onload = () => {
      console.log('Video buffer client loaded');
      
      // Set global buffer options for zero buffering
      if (window.setBufferOptions) {
        window.setBufferOptions({
          aggressiveCaching: true,
          prefetchAmount: 100, // Prefetch 100% of the video
          chunkSize: 2 * 1024 * 1024, // 2MB chunks for faster initial load
          parallelRequests: 4, // Use 4 parallel requests to speed up downloading
          preloadMetadata: true // Preload video metadata for faster start
        });
      }
    };
    document.head.appendChild(scriptElement);
    
    return () => {
      if (document.head.contains(scriptElement)) {
        document.head.removeChild(scriptElement);
      }
    };
  }, []);
  
  // Pre-buffer all videos on page load with maximum buffer priority
  useEffect(() => {
    if (!portfolioItems.length || !window.bufferVideo) return;
    
    // Track which videos we've already processed
    const processedVideos = new Set();
    
    // Precache all videos immediately with high priority for zero buffering
    portfolioItems.forEach(item => {
      if (window.bufferVideo && item.videoUrl && !processedVideos.has(item.id)) {
        processedVideos.add(item.id);
        console.log('Pre-buffering video:', item.videoUrl);
        
        // Set high priority for all videos to ensure zero buffering
        const isPriority = true;
        
        window.bufferVideo(item.videoUrl, (status) => {
          // Update buffer state for UI
          throttleBufferUpdate(item.id, () => {
            setBufferStates(prev => ({
              ...prev,
              [item.id]: { 
                isBuffering: !status.done, 
                progress: status.buffered,
                isPriority: isPriority
              }
            }));
          });
          
          // Enable playback once we have minimal buffer for instant start
          if (status.buffered >= 1 && visibleVideos[item.id] && !isMobile) {
            const videoElement = videoRefs.current[item.id];
            if (videoElement && videoElement.paused) {
              videoElement.currentTime = 0; // Start from beginning
              videoElement.play().catch(e => console.log("Auto play failed:", e));
            }
          }
        }, isPriority, { fullBuffer: true });
      }
    });
  }, [portfolioItems, visibleVideos, isMobile, throttleBufferUpdate]);

  // Prevent right-click context menu
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    
    // Prevent keyboard shortcuts for saving
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Load portfolio items
  useEffect(() => {
    const loadPortfolioItems = async () => {
      try {
        const items = await getPortfolioItems();
        setPortfolioItems(items.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate()));
      } catch (error) {
        console.error('Error loading portfolio items:', error);
        setError('Failed to load portfolio items');
      } finally {
        setLoading(false);
      }
    };

    loadPortfolioItems();
  }, []);

  // Initialize video states
  useEffect(() => {
    const initialStates = {};
    portfolioItems.forEach(item => {
      initialStates[item.id] = {
        time: 0,
        stopped: false,
        showFullOption: false,
        muted: true,
        isPlaying: false,
        isLoaded: false
      };
    });
    setVideoStates(initialStates);
  }, [portfolioItems]);

  // Enhanced video time update handler with improved reliability
  const handleTimeUpdate = useCallback((id) => {
    const videoElement = videoRefs.current[id];
    if (!videoElement) return;

    const currentTime = videoElement.currentTime;
    
    // Instead of stopping at 15 seconds, allow continuous playback
    // Just update time tracking for UI
    setVideoStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        time: currentTime
      }
    }));
    
    // If video reaches the end, loop it
    if (currentTime >= videoElement.duration - 0.5) {
      // Ensure looping is enabled
      videoElement.loop = true;
    }
  }, [videoStates]);

  // Setup additional backup timer to ensure videos loop properly
  const setupVideoTimeCheck = useCallback((id) => {
    const videoElement = videoRefs.current[id];
    if (!videoElement || timeCheckIntervals.current[id]) return;
    
    // Create an interval that checks video state every 2 seconds to ensure proper looping
    timeCheckIntervals.current[id] = setInterval(() => {
      const video = videoRefs.current[id];
      if (!video) {
        clearInterval(timeCheckIntervals.current[id]);
        timeCheckIntervals.current[id] = null;
        return;
      }
      
      // Ensure video is playing if it should be visible
      if (video.paused && visibleVideos[id] && !isMobile) {
        video.play().catch(e => console.log("Auto-resume failed:", e));
      }
      
      // Ensure looping is enabled
      video.loop = true;
    }, 2000);
  }, [visibleVideos, isMobile]);

  // Clean up all intervals on component unmount
  useEffect(() => {
    return () => {
      Object.keys(timeCheckIntervals.current).forEach(id => {
        if (timeCheckIntervals.current[id]) {
          clearInterval(timeCheckIntervals.current[id]);
        }
      });
    };
  }, []);

  // Setup advanced buffering detection with debounce
  const setupAdvancedBufferDetection = useCallback((videoElement, id) => {
    if (!videoElement) return;
    
    // Clear any existing event listeners
    videoElement.removeEventListener('waiting', () => {});
    videoElement.removeEventListener('playing', () => {});
    videoElement.removeEventListener('play', () => {});
    videoElement.removeEventListener('canplay', () => {});
    
    // Define better waiting handler with debounce
    const waitingHandler = () => {
      // Clear any existing timeouts
      if (waitingTimeouts.current[id]) {
        clearTimeout(waitingTimeouts.current[id]);
      }
      
      if (playingTimeouts.current[id]) {
        clearTimeout(playingTimeouts.current[id]);
      }
      
      // Set a small timeout to avoid rapid state changes
      waitingTimeouts.current[id] = setTimeout(() => {
        console.log(`Video ${id} waiting/buffering...`);
        
        setBufferStates(prev => ({
          ...prev,
          [id]: { 
            ...prev[id], 
            isBuffering: true,
            lastBufferTime: Date.now()
          }
        }));
      }, WAITING_DEBOUNCE_TIME);
    };
    
    // Define better playing handler with debounce
    const playingHandler = () => {
      // Clear any existing timeouts
      if (waitingTimeouts.current[id]) {
        clearTimeout(waitingTimeouts.current[id]);
      }
      
      if (playingTimeouts.current[id]) {
        clearTimeout(playingTimeouts.current[id]);
      }
      
      // Set a small timeout to avoid rapid state changes
      playingTimeouts.current[id] = setTimeout(() => {
        setBufferStates(prev => ({
          ...prev,
          [id]: { 
            ...prev[id], 
            isBuffering: false 
          }
        }));
      }, PLAYING_DEBOUNCE_TIME);
    };
    
    // Add event listeners
    videoElement.addEventListener('waiting', waitingHandler);
    videoElement.addEventListener('play', playingHandler);
    videoElement.addEventListener('playing', playingHandler);
    videoElement.addEventListener('canplay', playingHandler);
    
    // Return cleanup function
    return () => {
      videoElement.removeEventListener('waiting', waitingHandler);
      videoElement.removeEventListener('play', playingHandler);
      videoElement.removeEventListener('playing', playingHandler);
      videoElement.removeEventListener('canplay', playingHandler);
      
      if (waitingTimeouts.current[id]) {
        clearTimeout(waitingTimeouts.current[id]);
      }
      
      if (playingTimeouts.current[id]) {
        clearTimeout(playingTimeouts.current[id]);
      }
    };
  }, []);

  // Clean up all timeouts on component unmount
  useEffect(() => {
    return () => {
      Object.keys(waitingTimeouts.current).forEach(id => {
        if (waitingTimeouts.current[id]) {
          clearTimeout(waitingTimeouts.current[id]);
        }
      });
      
      Object.keys(playingTimeouts.current).forEach(id => {
        if (playingTimeouts.current[id]) {
          clearTimeout(playingTimeouts.current[id]);
        }
      });
      
      Object.keys(throttleTimeouts.current).forEach(id => {
        if (throttleTimeouts.current[id]) {
          clearTimeout(throttleTimeouts.current[id]);
        }
      });
    };
  }, []);

  // Enhanced video playback handler with service worker integration for zero buffering
  const handleVideoPlayback = useCallback((id, isVisible) => {
    const videoElement = videoRefs.current[id];
    if (!videoElement) return;

    if (isVisible) {
      // Setup advanced buffer detection on this video element
      setupAdvancedBufferDetection(videoElement, id);
      
      // Enable looping
      videoElement.loop = true;
      
      // Use service worker for buffering if available
      if (window.bufferVideo && !videoElement.getAttribute('data-buffer-id')) {
        videoElement.setAttribute('data-buffer-id', 'processing');
        
        // Request higher quality and priority for the buffer-worker
        const isPriority = Object.keys(visibleVideos).indexOf(id) < 4;
        
        window.bufferVideo(videoElement.src, (status) => {
          // Throttle buffer state updates to prevent excessive re-renders
          throttleBufferUpdate(id, () => {
            setBufferStates(prev => ({
              ...prev,
              [id]: { 
                isBuffering: !status.done, 
                progress: status.buffered 
              }
            }));
          });
          
          // Play video when we have enough buffer (5% is enough with continuous buffering)
          if (status.buffered >= 5 && isVisible && !isMobile) {
            const playPromise = videoElement.play();
            if (playPromise !== undefined) {
              playPromise.catch(e => console.log("Autoplay failed:", e));
            }
          }
        }, isPriority);
      }
      
      // Attempt to play the video if it's paused
      if (videoElement.paused && !isMobile) {
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Autoplay failed, normal on mobile:", error);
          });
        }
      }
      
      // Setup time checking for looping
      setupVideoTimeCheck(id);
    } else {
      // Continue buffering in background but pause playback when not visible
      if (!videoElement.paused) {
        videoElement.pause();
      }
    }
  }, [setupAdvancedBufferDetection, setupVideoTimeCheck, visibleVideos, isMobile, throttleBufferUpdate]);

  // Force videos to load after a timeout regardless of visibility
  useEffect(() => {
    const forceLoadTimeout = setTimeout(() => {
      portfolioItems.forEach(item => {
        const videoElement = videoRefs.current[item.id];
        if (videoElement && !videoStates[item.id]?.isLoaded) {
          console.log("Force loading video:", item.id);
          videoElement.load();
          setVideoStates(prev => ({
            ...prev,
            [item.id]: { ...prev[item.id], isLoaded: true }
          }));
          
          // Try to play the video if it's in viewport
          const rect = videoElement.getBoundingClientRect();
          const isInViewport = 
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth);
            
          if (isInViewport) {
            videoElement.play().catch(e => console.log("Force play failed:", e));
          }
        }
      });
    }, 5000); // Force load after 5 seconds

    return () => clearTimeout(forceLoadTimeout);
  }, [portfolioItems, videoStates]);

  // Optimized mute toggle
  const toggleMute = useCallback((e, id) => {
    e.stopPropagation();
    const videoElement = videoRefs.current[id];
    if (!videoElement) return;

    try {
      const newMutedState = !videoElement.muted;
      videoElement.muted = newMutedState;
      
      // Update volume and ensure it's audible when unmuted
      if (!newMutedState) {
        videoElement.volume = 1.0;
      }

      setVideoStates(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          muted: newMutedState
        }
      }));

      // Try to play if it was paused, but only if the video hasn't reached the 15s mark
      const shouldNotAutoplay = videoStates[id]?.shouldNotAutoplay || videoStates[id]?.stopped || stoppedVideos[id];
      
      if (newMutedState === false && videoElement.paused && !shouldNotAutoplay) {
        videoElement.play().catch(error => {
          console.log("Couldn't play after unmuting:", error);
          // If play fails, revert mute state
          videoElement.muted = true;
          setVideoStates(prev => ({
            ...prev,
            [id]: {
              ...prev[id],
              muted: true
            }
          }));
        });
      }
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
  }, [videoStates, stoppedVideos]);

  // Setup Intersection Observer for videos with improved threshold
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '200px 0px', // Increased margin to preload videos earlier
      threshold: 0.1, // Lower threshold to detect videos sooner
    };

    // Event handler functions stored per video id
    const timeUpdateHandlers = {};

    const handleIntersection = (entries, observer) => {
      entries.forEach(entry => {
        const videoId = entry.target.dataset.videoContainer;
        const video = entry.target.querySelector('video');
        
        if (!video) return;
        
        // Store the video element reference
        videoRefs.current[videoId] = video;

        // Update visibleVideos state based on intersection
        setVisibleVideos(prev => ({
          ...prev,
          [videoId]: entry.isIntersecting
        }));

        // Clean up any existing timeupdate handler for this video
        if (timeUpdateHandlers[videoId]) {
          video.removeEventListener('timeupdate', timeUpdateHandlers[videoId]);
        }

        // Skip if video is already marked as stopped
        if (stoppedVideos[videoId] || videoStates[videoId]?.stopped) {
          // Just ensure the video is paused
          if (!video.paused) {
            video.pause();
          }
          return;
        }

        // Create and store a new handler for this video
        timeUpdateHandlers[videoId] = () => handleTimeUpdate(videoId);
        
        // Add timeupdate event listener to track video time
        video.addEventListener('timeupdate', timeUpdateHandlers[videoId]);

        // Skip autoplay if fullscreen mode is active or if video has reached 15s mark
        const fullscreenOpen = document.body.style.overflow === 'hidden';
        const shouldNotAutoplay = videoStates[videoId]?.shouldNotAutoplay || videoStates[videoId]?.stopped || stoppedVideos[videoId];

        if (entry.isIntersecting && !fullscreenOpen && !shouldNotAutoplay) {
          // Ensure we respect existing mute state
          video.muted = videoStates[videoId]?.muted !== false;
          
          // Improved progressive loading
          if (!videoStates[videoId]?.playAttempted) {
            // Add a small delay before playing to allow initial buffering
            setTimeout(() => {
              // Double-check that we still shouldn't autoplay before attempting to play
              if (!videoStates[videoId]?.shouldNotAutoplay && !stoppedVideos[videoId]) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.log("Autoplay prevented:", error);
              // Try again while keeping muted
                    video.muted = true;
                    setVideoStates(prev => ({
                      ...prev,
                      [videoId]: { ...prev[videoId], muted: true }
                    }));
              video.play().catch(e => console.log("Couldn't play:", e));
            });
                }
                
                // Mark that we've attempted to play this video
                setVideoStates(prev => ({
                  ...prev,
                  [videoId]: { ...prev[videoId], playAttempted: true }
                }));
              }
            }, 100);
          } else if (!shouldNotAutoplay) {
            // For videos we've already tried to play before, just play them if they should autoplay
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch(e => console.log("Play error:", e));
            }
          }
        } else {
          if (!video.paused) {
            video.pause();
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, options);
    observerRefs.current = observer;

    // Clear existing observers
    observer.disconnect();

    // Observe all video elements with a shorter delay
    setTimeout(() => {
      portfolioItems.forEach(item => {
        const videoContainer = document.querySelector(`[data-video-container="${item.id}"]`);
        if (videoContainer) {
          observer.observe(videoContainer);
        }
      });
    }, 50); // Shorter delay to ensure faster observation

    return () => {
      // Clean up observer
      observer.disconnect();
      
      // Clean up timeupdate event listeners
      Object.keys(videoRefs.current).forEach(id => {
        const video = videoRefs.current[id];
        if (video && timeUpdateHandlers[id]) {
          video.removeEventListener('timeupdate', timeUpdateHandlers[id]);
        }
      });
    };
  }, [portfolioItems, showAll, videoStates, stoppedVideos, handleTimeUpdate]); // Added stoppedVideos and handleTimeUpdate dependencies

  const openFullscreenVideo = (e, videoUrl, id) => {
    e.stopPropagation();
    
    // Show loading state with better feedback
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'fixed inset-0 bg-black/80 z-[9999] flex flex-col items-center justify-center';
    loadingOverlay.innerHTML = `
      <div class="flex flex-col items-center gap-4">
        <div class="w-20 h-20 border-4 border-primary-700 border-t-transparent rounded-full animate-spin"></div>
        <div class="text-white font-medium text-lg">Loading video...</div>
        <div class="text-white/70 text-sm mb-2 buffer-status">Preparing video stream...</div>
        <div class="w-80 bg-secondary-200/30 rounded-full h-3 mt-1">
          <div class="bg-primary-700 h-3 rounded-full transition-all duration-300" style="width: 0%"></div>
        </div>
      </div>
    `;
    document.body.appendChild(loadingOverlay);
    
    // Pause all videos when fullscreen is opened to improve performance
    Object.keys(videoRefs.current).forEach(videoId => {
      try {
        const videoElement = videoRefs.current[videoId];
        if (videoElement && !videoElement.paused) {
          videoElement.pause();
        }
      } catch (err) {
        console.error("Error pausing video:", err);
      }
    });
    
    const statusText = loadingOverlay.querySelector('.buffer-status');
    const progressBar = loadingOverlay.querySelector('.bg-primary-700');
    let videoStarted = false;
    
    // Use service worker for buffering if available
    if (window.bufferVideo) {
      statusText.textContent = 'Please Wait...';
      
      window.bufferVideo(videoUrl, (status) => {
        if (progressBar) {
          progressBar.style.width = `${status.buffered}%`;
        }
        
        if (statusText) {
          statusText.textContent = `Buffered ${status.buffered}% of video...${status.speed ? ` (${status.speed} MB/s)` : ''}`;
        }
        
        // When we have enough buffer, show the player
        if ((status.buffered >= 20 || status.done) && !videoStarted) {
          videoStarted = true;
          showFullscreenPlayer();
        }
      });
      
      // Fallback if buffering takes too long
      setTimeout(() => {
        if (!videoStarted) {
          videoStarted = true;
          showFullscreenPlayer();
        }
      }, 5000);
    } else {
      // Fall back to original implementation
      // ... existing fetch code ...
    }
    
    // Create the actual fullscreen player
    const showFullscreenPlayer = () => {
      // If the overlay was removed already, don't proceed
      if (!document.body.contains(loadingOverlay)) return;
      
      // Remove preload elements
      document.body.removeChild(loadingOverlay);
    
    // Create container with dark background
    const container = document.createElement('div');
    container.className = 'fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center touch-none overflow-hidden';
    container.style.opacity = '0';
    container.style.transform = 'scale(0.98)';
    container.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // Mark the video as viewed in fullscreen mode if id is provided
    if (id && videoRefs.current[id]) {
        // Pause the original video
        if (!videoRefs.current[id].paused) {
            videoRefs.current[id].pause();
        }
        
        // Track that this video has been viewed in fullscreen
        setStoppedVideos(prev => ({
            ...prev,
            [id]: true
        }));
    }
    
    // Create header with back button
    const header = document.createElement('div');
    header.className = 'absolute top-0 left-0 right-0 z-[9999]';
    
    const backButton = document.createElement('button');
    backButton.className = `
        fixed ${isMobile ? 'top-8' : 'top-6'} ${isMobile ? 'left-4' : 'left-6'} z-[9999]
        flex items-center gap-2 
        px-3 py-2 sm:px-4 sm:py-2 
        rounded-lg bg-black/90 
        text-white text-sm sm:text-base font-medium 
        transition-all duration-300 
        border border-white/20
        shadow-lg
    `;
    backButton.innerHTML = `
        <svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>${isMobile ? '' : 'Back'}</span>
    `;
    
    // Create video wrapper
    const videoWrapper = document.createElement('div');
    videoWrapper.className = 'flex items-center justify-center w-full h-full touch-none overflow-hidden';
    
      // Create and configure video element with improved buffering
    const videoElement = document.createElement('video');
    videoElement.className = 'w-auto h-auto max-h-[90vh] max-w-[95vw] object-contain touch-none';
    videoElement.src = videoUrl;
    videoElement.controls = true;
    videoElement.autoplay = true;
    videoElement.controlsList = 'nodownload nopictureinpicture';
    videoElement.disablePictureInPicture = true;
    videoElement.playsInline = true;
    videoElement.preload = 'auto';
      videoElement.crossOrigin = 'anonymous';
      
      // Add data-buffer attribute for service worker to pick up
      videoElement.setAttribute('data-buffer', 'true');
      
      // Set buffer mode to auto to prioritize uninterrupted playback
      if (typeof videoElement.playbackRate !== 'undefined') {
        // Skip initial frame for faster start
        videoElement.currentTime = 0.1;
      }

      // Add buffer monitoring
      const bufferHandler = () => {
        // Check if we need to add a buffering indicator
        if (videoElement.readyState < 3 && !videoElement.paused) {
          // Show buffer indicator
          if (!document.querySelector('.fullscreen-buffer-indicator')) {
            const bufferIndicator = document.createElement('div');
            bufferIndicator.className = 'fullscreen-buffer-indicator absolute inset-0 bg-black/50 flex items-center justify-center';
            bufferIndicator.innerHTML = `
              <div class="w-16 h-16 border-4 border-primary-700 border-t-transparent rounded-full animate-spin"></div>
            `;
            videoWrapper.appendChild(bufferIndicator);
          }
        } else {
          // Remove buffer indicator if it exists
          const indicator = document.querySelector('.fullscreen-buffer-indicator');
          if (indicator) {
            indicator.remove();
          }
        }
      };
      
      videoElement.addEventListener('waiting', bufferHandler);
      videoElement.addEventListener('playing', bufferHandler);
      videoElement.addEventListener('canplay', bufferHandler);

    // Handle closing with smooth animation
    const closeFullscreen = async () => {
        try {
            container.style.opacity = '0';
            container.style.transform = 'scale(0.98)';
            
            const cleanup = () => {
                try {
                    if (videoElement) {
                        videoElement.pause();
                        videoElement.removeAttribute('src');
                        videoElement.load();
                    }
                    
                    if (container && document.body.contains(container)) {
                        document.body.removeChild(container);
                    }
                    
                    document.body.style.overflow = 'auto';
                    
                    // Scroll to portfolio section
                    const portfolioSection = document.getElementById('portfolio');
                    if (portfolioSection) {
                        portfolioSection.scrollIntoView({ behavior: 'smooth' });
                    }
                } catch (error) {
                    console.log('Error during cleanup:', error);
                }
            };
            
            setTimeout(cleanup, 300);
        } catch (error) {
            console.log('Error during close:', error);
        }
    };
    
    // Add click handlers
    backButton.onclick = (e) => {
        e.stopPropagation();
        closeFullscreen();
    };

    // Handle escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeFullscreen();
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Clean up event listeners
    container.addEventListener('remove', () => {
        document.removeEventListener('keydown', handleEscape);
    });
    
    // Prevent right-click menu
    videoElement.oncontextmenu = () => false;
    
    // Assemble the components
    header.appendChild(backButton);
    videoWrapper.appendChild(videoElement);
    container.appendChild(header);
    container.appendChild(videoWrapper);
    document.body.appendChild(container);
    document.body.style.overflow = 'hidden';
    
    // Trigger entrance animation
    requestAnimationFrame(() => {
        container.style.opacity = '1';
        container.style.transform = 'scale(1)';
    });
    
      // Improved startup sequence with better buffering
      const playFullscreenVideo = async () => {
        try {
          // Small delay for initial buffer
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Try to play the video
          const playResult = videoElement.play();
          if (playResult !== undefined) {
            playResult.catch(error => {
              console.log("Fullscreen play error:", error);
              // If autoplay fails, show a play button overlay
              const playOverlay = document.createElement('div');
              playOverlay.className = 'absolute inset-0 bg-black/70 flex items-center justify-center cursor-pointer';
              playOverlay.innerHTML = `
                <div class="w-20 h-20 rounded-full bg-primary-700 flex items-center justify-center shadow-xl">
                  <svg class="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                  </svg>
                </div>
              `;
              
              // Play when clicked
              playOverlay.addEventListener('click', () => {
                videoElement.play().catch(e => console.log("Play error after click:", e));
                playOverlay.remove();
              });
              
              videoWrapper.appendChild(playOverlay);
            });
          }
        } catch (error) {
          console.error("Error in playFullscreenVideo:", error);
        }
      };
      
      playFullscreenVideo();
    };
};

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
  };

  const handleItemClick = (id) => {
    if (isMobile) {
      setShowDetails(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
      setShowControls(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    } else {
      // For desktop, toggle video controls and full video option
      setShowFullVideoOption(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
      
      // If the video is already playing, pause it to indicate it's been selected
      if (videoRefs.current[id] && !videoRefs.current[id].paused && !stoppedVideos[id]) {
        videoRefs.current[id].pause();
      }
    }
  };

  // Sort videos by date (newest first) and split into initial and remaining
  const sortedVideos = [...portfolioItems].sort((a, b) => new Date(b.createdAt.toDate()) - new Date(a.createdAt.toDate()));
  const initialVideos = sortedVideos.slice(0, 4);
  const remainingVideos = sortedVideos.slice(4);

  return (
    <div id="portfolio" className="w-full min-h-screen pt-28 pb-20 bg-secondary-100">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-primary-900 mb-6 relative">
              <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-primary-700/5 text-7xl md:text-8xl font-bold whitespace-nowrap">
                Our Work
              </span>
              Our Work
            </h2>
            <div className="w-24 h-1 bg-primary-700 mx-auto mb-6" />
            <p className="text-primary-800 max-w-[600px] mx-auto text-lg">
              Featured events we've captured.
            </p>
          </motion.div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-primary-700 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-20">
            {error}
          </div>
        ) : portfolioItems.length === 0 ? (
          <div className="text-primary-800 text-center py-20">
            No portfolio items available yet.
          </div>
        ) : (
        <div className="grid md:grid-cols-2 gap-8">
            {/* Initial Videos */}
            {initialVideos.map((item, index) => (
            <motion.div
                key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                className="group relative overflow-hidden rounded-xl shadow-lg border border-secondary-300/50 bg-secondary-200/30 backdrop-blur-sm"
                onMouseEnter={() => {
                  !isMobile && setHoveredVideo(item.id);
                }}
                onMouseLeave={() => {
                  !isMobile && setHoveredVideo(null);
                }}
                onClick={() => handleItemClick(item.id)}
              >
                <motion.div
                  className="relative w-full h-[300px]"
                  whileHover={{ scale: isMobile ? 1 : 1.05 }}
                  transition={{ duration: 0.4 }}
                  data-video-container={item.id}
                >
                  <OptimizedVideo
                    src={item.videoUrl}
                    posterSrc={item.thumbnail}
                    className="w-full h-full"
                    priority={true}
                    data-buffer="true"
                    ref={el => {
                      if (el) {
                        videoRefs.current[item.id] = el;
                        
                        // Set initial attributes
                        el.muted = true;
                        el.playsInline = true;
                        el.preload = "auto";
                        el.crossOrigin = "anonymous"; // Required for service worker caching
                        
                        // Setup better buffering detection
                        setupAdvancedBufferDetection(el, item.id);
                        
                        // Ensure any existing listener is removed first to prevent duplicates
                        const existingHandler = () => handleTimeUpdate(item.id);
                        el.removeEventListener('timeupdate', existingHandler);
                        
                        // Add timeupdate listener with proper binding
                        const timeUpdateHandler = () => handleTimeUpdate(item.id);
                        el.addEventListener('timeupdate', timeUpdateHandler);
                        
                        // Add loadeddata event to start time checking once the video loads
                        el.addEventListener('loadeddata', () => {
                          // Check if we need to stop right away (for videos that might have been cached)
                          if (el.currentTime >= 15) {
                            handleTimeUpdate(item.id);
                          }
                          
                          // Setup the backup timer
                          setupVideoTimeCheck(item.id);
                        }, { once: true });
                        
                        // Use Intersection Observer
                        const observer = new IntersectionObserver(
                          ([entry]) => handleVideoPlayback(item.id, entry.isIntersecting),
                          { threshold: 0.3 }
                        );
                        observer.observe(el.parentElement);
                        
                        // Cleanup on unmount
                        return () => {
                          el.removeEventListener('timeupdate', timeUpdateHandler);
                          if (timeCheckIntervals.current[item.id]) {
                            clearInterval(timeCheckIntervals.current[item.id]);
                            timeCheckIntervals.current[item.id] = null;
                          }
                          observer.disconnect();
                        };
                      }
                    }}
                  />
                  
                  {/* Sound Control Button - Shows on hover for desktop and on click for mobile */}
                  <AnimatePresence>
                    {(hoveredVideo === item.id || (isMobile && showControls[item.id])) && (
                      <motion.button
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-4 right-4 bg-secondary-100/50 p-2.5 rounded-full text-primary-900 hover:bg-secondary-200/70 transition-all z-20 backdrop-blur-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMute(e, item.id);
                        }}
                      >
                        {videoRefs.current[item.id]?.muted ? 
                          <FaVolumeMute size={20} /> : 
                          <FaVolumeUp size={20} />
                        }
                      </motion.button>
                    )}
                  </AnimatePresence>
                  
                  {/* Full Video Button - Show on hover, when clicked, or after 15 seconds */}
                  <AnimatePresence>
                    {(hoveredVideo === item.id || showFullVideoOption[item.id] || videoStates[item.id]?.showFullOption || (isMobile && showControls[item.id])) && (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-4 left-4 bg-primary-700/70 px-3 py-2 rounded-md text-white hover:bg-primary-800 transition-all z-20 backdrop-blur-sm flex items-center space-x-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          openFullscreenVideo(e, item.videoUrl, item.id);
                        }}
                      >
                        <FaExpand size={16} />
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {/* Stopped Video Overlay */}
                  {(stoppedVideos[item.id] || videoStates[item.id]?.stopped) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex items-center justify-center bg-secondary-100/50"
                    >
                      <motion.button
                        className="bg-primary-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-primary-800 transition-colors z-10 transform hover:scale-105"
                        onClick={(e) => {
                          e.stopPropagation();
                          openFullscreenVideo(e, item.videoUrl, item.id);
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaExpand className="mr-2" />
                        View Full Video
                      </motion.button>
                    </motion.div>
                  )}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-t from-secondary-100/90 via-secondary-100/50 to-transparent transition-all duration-300`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isMobile ? (showDetails[item.id] ? 1 : 0) : (hoveredVideo === item.id ? 1 : 0) }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 p-6"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ 
                        y: isMobile ? (showDetails[item.id] ? 0 : 20) : (hoveredVideo === item.id ? 0 : 20),
                        opacity: isMobile ? (showDetails[item.id] ? 1 : 0) : (hoveredVideo === item.id ? 1 : 0)
                      }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <p className="text-primary-700 text-sm font-semibold mb-2">{item.category}</p>
                      <h3 className="text-xl font-bold text-primary-900 mb-2">{item.title}</h3>
                      <p className="text-primary-800">{item.description}</p>
                    </motion.div>
                  </motion.div>
                </motion.div>
            </motion.div>
          ))}
        </div>
        )}

        {/* View More Section */}
        {remainingVideos.length > 0 && (
          <div className="mt-12 text-center">
            <motion.button
              onClick={() => setShowAll(!showAll)}
              className="group flex items-center justify-center gap-2 mx-auto px-8 py-3 bg-secondary-100 hover:bg-secondary-200 text-primary-900 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="font-medium">
                {showAll ? 'Show Less' : `View ${remainingVideos.length} More`}
              </span>
              <motion.div
                animate={{ rotate: showAll ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {showAll ? <FaChevronUp /> : <FaChevronDown />}
              </motion.div>
            </motion.button>
          </div>
        )}

        {/* Expanded Videos */}
        <AnimatePresence>
          {showAll && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className="grid md:grid-cols-2 gap-8 mt-12 overflow-hidden"
            >
              {remainingVideos.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative overflow-hidden rounded-xl shadow-lg border border-secondary-300/50 bg-secondary-200/30 backdrop-blur-sm"
                  onMouseEnter={() => {
                    !isMobile && setHoveredVideo(item.id);
                  }}
                  onMouseLeave={() => {
                    !isMobile && setHoveredVideo(null);
                  }}
                  onClick={() => handleItemClick(item.id)}
                >
                  <motion.div
                    className="relative w-full h-[300px]"
                    whileHover={{ scale: isMobile ? 1 : 1.05 }}
                    transition={{ duration: 0.4 }}
                    data-video-container={item.id}
                  >
                    <OptimizedVideo
                      src={item.videoUrl}
                      posterSrc={item.thumbnail}
                      className="w-full h-full"
                      priority={true}
                      data-buffer="true"
                      ref={el => {
                        if (el) {
                          videoRefs.current[item.id] = el;
                          
                          // Set initial attributes
                          el.muted = true;
                          el.playsInline = true;
                          el.preload = "auto";
                          el.crossOrigin = "anonymous"; // Required for service worker caching
                          
                          // Setup better buffering detection
                          setupAdvancedBufferDetection(el, item.id);
                          
                          // Ensure any existing listener is removed first to prevent duplicates
                          const existingHandler = () => handleTimeUpdate(item.id);
                          el.removeEventListener('timeupdate', existingHandler);
                          
                          // Add timeupdate listener with proper binding
                          const timeUpdateHandler = () => handleTimeUpdate(item.id);
                          el.addEventListener('timeupdate', timeUpdateHandler);
                          
                          // Add loadeddata event to start time checking once the video loads
                          el.addEventListener('loadeddata', () => {
                            // Check if we need to stop right away (for videos that might have been cached)
                            if (el.currentTime >= 15) {
                              handleTimeUpdate(item.id);
                            }
                            
                            // Setup the backup timer
                            setupVideoTimeCheck(item.id);
                          }, { once: true });
                          
                          // Use Intersection Observer
                          const observer = new IntersectionObserver(
                            ([entry]) => handleVideoPlayback(item.id, entry.isIntersecting),
                            { threshold: 0.3 }
                          );
                          observer.observe(el.parentElement);
                          
                          // Cleanup on unmount
                          return () => {
                            el.removeEventListener('timeupdate', timeUpdateHandler);
                            if (timeCheckIntervals.current[item.id]) {
                              clearInterval(timeCheckIntervals.current[item.id]);
                              timeCheckIntervals.current[item.id] = null;
                            }
                            observer.disconnect();
                          };
                        }
                      }}
                    />
                    
                    {/* Sound Control Button - Shows on hover for desktop and on click for mobile */}
                    <AnimatePresence>
                      {(hoveredVideo === item.id || (isMobile && showControls[item.id])) && (
                        <motion.button
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-4 right-4 bg-secondary-100/50 p-2.5 rounded-full text-primary-900 hover:bg-secondary-200/70 transition-all z-20 backdrop-blur-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMute(e, item.id);
                          }}
                        >
                          {videoRefs.current[item.id]?.muted ? 
                            <FaVolumeMute size={20} /> : 
                            <FaVolumeUp size={20} />
                          }
                        </motion.button>
                      )}
                    </AnimatePresence>

                    {/* Full Video Button - Show on hover, when clicked, or after 15 seconds */}
                    <AnimatePresence>
                      {(hoveredVideo === item.id || showFullVideoOption[item.id] || videoStates[item.id]?.showFullOption || (isMobile && showControls[item.id])) && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-4 left-4 bg-primary-700/70 px-3 py-2 rounded-md text-white hover:bg-primary-800 transition-all z-20 backdrop-blur-sm flex items-center space-x-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            openFullscreenVideo(e, item.videoUrl, item.id);
                          }}
                        >
                          <FaExpand size={16} />
                          <span className="text-sm font-medium">Full Video</span>
                        </motion.button>
                      )}
                    </AnimatePresence>

                    {/* Stopped Video Overlay */}
                    {(stoppedVideos[item.id] || videoStates[item.id]?.stopped) && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 flex items-center justify-center bg-secondary-100/50"
                      >
                        <motion.button
                          className="bg-primary-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-primary-800 transition-colors z-10 transform hover:scale-105"
                          onClick={(e) => {
                            e.stopPropagation();
                            openFullscreenVideo(e, item.videoUrl, item.id);
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaExpand className="mr-2" />
                          View Full Video
                        </motion.button>
                      </motion.div>
                    )}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-t from-secondary-100/90 via-secondary-100/50 to-transparent transition-all duration-300`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isMobile ? (showDetails[item.id] ? 1 : 0) : (hoveredVideo === item.id ? 1 : 0) }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div 
                        className="absolute bottom-0 left-0 right-0 p-6"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ 
                          y: isMobile ? (showDetails[item.id] ? 0 : 20) : (hoveredVideo === item.id ? 0 : 20),
                          opacity: isMobile ? (showDetails[item.id] ? 1 : 0) : (hoveredVideo === item.id ? 1 : 0)
                        }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <p className="text-primary-700 text-sm font-semibold mb-2">{item.category}</p>
                        <h3 className="text-xl font-bold text-primary-900 mb-2">{item.title}</h3>
                        <p className="text-primary-800">{item.description}</p>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden"
            >
              <button
                className="absolute top-4 right-4 text-white text-2xl hover:text-copper-400 transition-colors duration-300"
                onClick={handleCloseModal}
              >
                ×
              </button>
              <OptimizedVideo
                src={selectedVideo.videoUrl}
                posterSrc={selectedVideo.thumbnail}
                className="w-full h-full"
                priority={true}
                autoPlay={true}
                controls={true}
                muted={false}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Portfolio; 
