import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowDown } from 'react-icons/fa';
import { Link } from 'react-scroll';
import { useIsVisible } from '../hooks/useIsVisible';
import backgroundVideo from '../assets/mainbackgroundvideo/main.mp4';

const Hero = () => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const videoRef = useRef(null);
  const { isVisible, targetRef } = useIsVisible({
    rootMargin: '100px',
    threshold: 0.1
  }, true);

  // Handle loading animation and timing
  useEffect(() => {
    if (!isLoading) return;

    // Force complete loading after 2 seconds
    const forceCompleteTimeout = setTimeout(() => {
      setLoadingProgress(100);
      setTimeout(() => setIsLoading(false), 200);
    }, 1800);

    // Animate loading progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10; // Increase by 10% each time to reach ~95% in 1.8 seconds
      if (progress >= 95) {
        clearInterval(interval);
      } else {
        setLoadingProgress(progress);
      }
    }, 200);

    return () => {
      clearTimeout(forceCompleteTimeout);
      clearInterval(interval);
    };
  }, [isLoading]);

  // Handle video loading
  useEffect(() => {
    if (!isVisible || !videoRef.current) return;

    const video = videoRef.current;

    const handleLoadedData = () => {
      setIsVideoLoaded(true);
    };

    const handleError = () => {
      console.error('Error loading video');
      setVideoError(true);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    // Start loading the video
    video.load();

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, [isVisible]);

  // Loading Screen
  if (isLoading) {
    return (
      <motion.div 
        ref={targetRef}
        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-white mb-4"
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scale: [0.98, 1, 0.98]
            }}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            INA Creations
          </motion.h1>
          <motion.div className="w-48 h-1 bg-gray-800 rounded-full mx-auto overflow-hidden">
            <motion.div 
              className="h-full bg-[#ff6d6d]"
              initial={{ width: "0%" }}
              animate={{ width: `${loadingProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
          <motion.p
            className="text-gray-400 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {loadingProgress < 100 
              ? `Loading ${Math.round(loadingProgress)}%` 
              : 'Welcome...'}
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div id="home" ref={targetRef} className="relative w-full h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10" />
        <AnimatePresence>
          {!videoError && (
            <motion.video
              ref={videoRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="absolute top-0 left-0 w-full h-full object-cover"
            >
              <source src={backgroundVideo} type="video/mp4" />
            </motion.video>
          )}
        </AnimatePresence>

        {videoError && (
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-900 to-black" />
        )}
      </div>

      {/* Content */}
      <div className="relative z-20 w-full h-full flex flex-col justify-center items-center">
        <div className="max-w-[1200px] w-full px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-white text-center"
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              Capturing Your Events,
              <br />
              <span className="text-[#ff6d6d]">Creating Memories</span>
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-gray-200 max-w-[800px] mx-auto mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              Professional event photography and videography services that turn moments into lasting memories.
            </motion.p>

            {/* CTA Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
              className="flex justify-center"
            >
              <Link to="contact" smooth={true} duration={500}>
                <button className="px-8 py-4 bg-[#ff6d6d] text-white rounded-full font-bold text-lg hover:bg-[#ff5555] transition-all hover:scale-105 duration-300">
                  Get Started
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div 
        className="absolute bottom-10 w-full flex justify-center items-center z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1, repeat: Infinity, repeatType: "reverse" }}
      >
        <Link to="services" smooth={true} duration={500} className="cursor-pointer">
          <FaArrowDown className="text-white text-2xl animate-bounce" />
        </Link>
      </motion.div>

      {/* Gradient Overlay */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/50 to-transparent z-10" />
    </div>
  );
};

export default Hero; 