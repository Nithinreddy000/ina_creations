import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowDown } from 'react-icons/fa';
import { Link } from 'react-scroll';
import { useIsVisible } from '../hooks/useIsVisible';
import backgroundVideo from '../assets/mainbackgroundvideo/main.mp4';
import { OptimizedVideo } from '../utils/videoOptimization';
import { useOptimizedAnimations, animationVariants } from '../utils/animationOptimization';

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
  
  // Get optimized animation settings based on device performance
  const { 
    shouldReduceMotion,
    devicePerformance,
    getAnimationSettings,
    getStaggerAmount
  } = useOptimizedAnimations();

  // Handle loading animation and timing
  useEffect(() => {
    if (!isLoading) return;

    // Use shorter loading time for high performance devices
    const loadingTime = devicePerformance === 'high' ? 1500 : 1800;

    // Force complete loading after loadingTime
    const forceCompleteTimeout = setTimeout(() => {
      setLoadingProgress(100);
      setTimeout(() => setIsLoading(false), 200);
    }, loadingTime);

    // Animate loading progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += devicePerformance === 'high' ? 12 : 10; // Faster for high performance devices
      if (progress >= 95) {
        clearInterval(interval);
      } else {
        setLoadingProgress(progress);
      }
    }, devicePerformance === 'high' ? 150 : 200);

    return () => {
      clearTimeout(forceCompleteTimeout);
      clearInterval(interval);
    };
  }, [isLoading, devicePerformance]);

  // Handle video loading
  const handleVideoLoaded = () => {
    setIsVideoLoaded(true);
  };

  const handleVideoError = () => {
    console.error('Error loading video');
    setVideoError(true);
  };

  // Loading Screen
  if (isLoading) {
    const loadingAnimation = shouldReduceMotion 
      ? animationVariants.lowPerformance.fadeIn
      : animationVariants.fadeIn;
      
    return (
      <motion.div 
        ref={targetRef}
        className="fixed inset-0 bg-secondary-100 z-50 flex items-center justify-center"
        exit={{ opacity: 0 }}
        transition={{ duration: shouldReduceMotion ? 0.1 : 0.2 }}
      >
        <motion.div
          initial={loadingAnimation.hidden}
          animate={loadingAnimation.visible}
          transition={{ duration: shouldReduceMotion ? 0.2 : 0.3 }}
          className="text-center"
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-primary-700 mb-4"
            animate={shouldReduceMotion ? { opacity: 1 } : { 
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
          <motion.div className="w-48 h-1 bg-secondary-200 rounded-full mx-auto overflow-hidden">
            <motion.div 
              className="h-full bg-primary-700"
              initial={{ width: "0%" }}
              animate={{ width: `${loadingProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
          <motion.p
            className="text-primary-900 mt-4"
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
        <div className="absolute top-0 left-0 w-full h-full bg-black/75 z-10" />
        <AnimatePresence>
          {!videoError && (
            <OptimizedVideo
              src={backgroundVideo}
              className="absolute top-0 left-0 w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              onLoaded={handleVideoLoaded}
              onError={handleVideoError}
              priority={true} // Load video immediately for hero section
            />
          )}
        </AnimatePresence>

        {videoError && (
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-secondary-200 to-secondary-100" />
        )}
      </div>

      {/* Content */}
      <div className="relative z-20 w-full h-full flex flex-col justify-center items-center">
        <div className="max-w-[1200px] w-full px-4 md:px-8">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 50 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.5 : 1, delay: 0.5 }}
            className="text-center"
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg shadow-black"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              Capturing Your Events,
              <br />
              <span className="text-primary-300 drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)]">Creating Memories</span>
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-white max-w-[800px] mx-auto mb-12 drop-shadow-md bg-black/10 py-2 px-4 rounded-lg backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              Professional event photography and videography services that turn moments into lasting memories.
            </motion.p>

            {/* CTA Button */}
            <motion.div 
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
              className="flex justify-center"
            >
              <Link to="contact" smooth={true} duration={500}>
                <button className="px-8 py-4 bg-primary-700 text-white rounded-full font-bold text-lg hover:bg-primary-800 transition-all hover:scale-105 duration-300 shadow-lg">
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
        transition={{ 
          delay: 2,
          duration: 1,
          ease: "easeOut"
        }}
      >
        <Link to="services" smooth={true} duration={1000} offset={-100}>
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut"
            }}
            className="cursor-pointer flex flex-col items-center"
          >
            <p className="text-white mb-2 font-medium drop-shadow-md">Scroll Down</p>
            <div className="bg-primary-700/50 p-3 rounded-full border border-primary-700/50 shadow-md">
              <FaArrowDown className="text-white text-lg" />
            </div>
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
};

export default Hero; 