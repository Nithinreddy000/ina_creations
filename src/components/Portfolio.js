import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPortfolioItems } from '../utils/firebase';
import { FaExpand, FaVolumeMute, FaVolumeUp, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import OptimizedVideo from './OptimizedVideo';

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
  const [showAll, setShowAll] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

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
                    priority={index < 2}
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

                  {stoppedVideos[item.id] && (
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

                    {stoppedVideos[item.id] && (
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