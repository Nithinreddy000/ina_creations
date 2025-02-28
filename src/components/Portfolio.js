import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPortfolioItems } from '../utils/firebase';
import { FaExpand, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';

const Portfolio = () => {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoTimes, setVideoTimes] = useState({});
  const [showDetails, setShowDetails] = useState({});
  const [stoppedVideos, setStoppedVideos] = useState({});
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const [showControls, setShowControls] = useState({});
  const videoRefs = useRef({});
  const observerRefs = useRef({});
  const isMobile = window.innerWidth <= 768;

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

  // Initialize video times and stopped states
  useEffect(() => {
    const initialTimes = {};
    const initialStoppedState = {};
    portfolioItems.forEach(item => {
      initialTimes[item.id] = 0;
      initialStoppedState[item.id] = false;
    });
    setVideoTimes(initialTimes);
    setStoppedVideos(initialStoppedState);
  }, [portfolioItems]);

  // Setup Intersection Observer for videos
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };

    const handleIntersection = (entries, observer) => {
      entries.forEach(entry => {
        const videoId = entry.target.dataset.videoId;
        const video = videoRefs.current[videoId];
        
        if (!video) return;

        if (entry.isIntersecting) {
          video.muted = true; // Keep muted
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.log("Autoplay prevented:", error);
              // Try again while keeping muted
              video.play().catch(e => console.log("Couldn't play:", e));
            });
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

    // Observe all video elements
    portfolioItems.forEach(item => {
      const videoContainer = document.querySelector(`[data-video-container="${item.id}"]`);
      if (videoContainer) {
        observer.observe(videoContainer);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [portfolioItems]);

  const handleTimeUpdate = (id) => {
    if (videoRefs.current[id]) {
      const currentTime = videoRefs.current[id].currentTime;
      
      setVideoTimes(prev => ({
        ...prev,
        [id]: currentTime
      }));
      
      // Stop video after 30 seconds
      if (currentTime >= 30 && !stoppedVideos[id]) {
        videoRefs.current[id].pause();
        setStoppedVideos(prev => ({
          ...prev,
          [id]: true
        }));
      }
    }
  };

  const toggleMute = (e, id) => {
    e.stopPropagation();
    if (videoRefs.current[id]) {
      videoRefs.current[id].muted = !videoRefs.current[id].muted;
    }
  };

  const openFullscreenVideo = (e, videoUrl) => {
    e.stopPropagation();
    
    // Create container with dark background
    const container = document.createElement('div');
    container.className = 'fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center touch-none overflow-hidden';
    container.style.opacity = '0';
    container.style.transform = 'scale(0.98)';
    container.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    
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
    
    // Create and configure video element
    const videoElement = document.createElement('video');
    videoElement.className = 'w-auto h-auto max-h-[90vh] max-w-[95vw] object-contain touch-none';
    videoElement.src = videoUrl;
    videoElement.controls = true;
    videoElement.autoplay = true;
    videoElement.controlsList = 'nodownload nopictureinpicture';
    videoElement.disablePictureInPicture = true;
    videoElement.playsInline = true;
    videoElement.preload = 'auto';

    // Set initial quality to lower for faster start
    if (videoElement.canPlayType('video/mp4')) {
        videoElement.currentTime = 0.1; // Skip initial frame for faster start
    }

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
    
    // Add loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'absolute inset-0 flex items-center justify-center bg-black/50';
    loadingIndicator.innerHTML = `
        <div class="w-12 h-12 border-4 border-[#ff6d6d] border-t-transparent rounded-full animate-spin"></div>
    `;
    videoWrapper.appendChild(loadingIndicator);
    
    // Handle video loading
    videoElement.addEventListener('canplay', () => {
        if (loadingIndicator.parentNode) {
            loadingIndicator.remove();
        }
    });
    
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
    
    // Start playback immediately
    videoElement.play().catch(error => {
        console.log("Fullscreen play prevented:", error);
    });
};

  const handleVideoClick = (id) => {
    if (stoppedVideos[id]) {
      const video = videoRefs.current[id];
      if (video) {
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Play prevented:", error);
          });
        }
      }
    }
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
    }
  };

  return (
    <div id="portfolio" className="w-full min-h-screen pt-28 pb-20 bg-gray-900">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 relative">
              <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-[#ff6d6d]/5 text-7xl md:text-8xl font-bold whitespace-nowrap">
                Our Work
              </span>
              Our Work
            </h2>
            <div className="w-24 h-1 bg-[#ff6d6d] mx-auto mb-6" />
            <p className="text-gray-400 max-w-[600px] mx-auto text-lg">
              Featured events we've captured.
            </p>
          </motion.div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-[#ff6d6d] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-400 text-center py-20">
            {error}
          </div>
        ) : portfolioItems.length === 0 ? (
          <div className="text-gray-400 text-center py-20">
            No portfolio items available yet.
          </div>
        ) : (
        <div className="grid md:grid-cols-2 gap-8">
            {portfolioItems.map((item) => (
            <motion.div
                key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, margin: "-100px" }}
                className="group relative overflow-hidden rounded-xl shadow-lg border border-gray-700/50 bg-gray-800/30 backdrop-blur-sm"
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
                  <video
                    ref={el => videoRefs.current[item.id] = el}
                    className="w-full h-full object-cover cursor-pointer"
                    src={item.videoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    webkit-playsinline="true"
                    preload="auto"
                    data-video-id={item.id}
                    controlsList="nodownload nopictureinpicture"
                    disablePictureInPicture
                    onContextMenu={() => false}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVideoClick(item.id);
                    }}
                    onTimeUpdate={() => handleTimeUpdate(item.id)}
                    onLoadedData={(e) => {
                      const video = e.target;
                      video.muted = true;
                      const playPromise = video.play();
                      if (playPromise !== undefined) {
                        playPromise.catch(error => {
                          console.log("Initial play prevented:", error);
                          video.play().catch(e => console.log("Couldn't play:", e));
                        });
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
                        className="absolute top-4 right-4 bg-black/50 p-2.5 rounded-full text-white hover:bg-black/70 transition-all z-20 backdrop-blur-sm"
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

                  {stoppedVideos[item.id] && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/50"
                    >
                      <motion.button
                        className="bg-[#ff6d6d] text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-[#ff5555] transition-colors z-10 transform hover:scale-105"
                        onClick={(e) => {
                          e.stopPropagation();
                          openFullscreenVideo(e, item.videoUrl);
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
                    className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-all duration-300`}
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
                      <p className="text-[#ff6d6d] text-sm font-semibold mb-2">{item.category}</p>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-300">{item.description}</p>
                    </motion.div>
                  </motion.div>
                </motion.div>
            </motion.div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio; 