import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowDown } from 'react-icons/fa';
import { Link } from 'react-scroll';
import { useIsVisible } from '../hooks/useIsVisible';
import backgroundVideo from '../assets/mainbackgroundvideo/main.mp4';
import { OptimizedVideo } from '../utils/videoOptimization';
import { useOptimizedAnimations, animationVariants } from '../utils/animationOptimization';
import { useLoading } from '../utils/loadingManager';

// Get the placeholder image for the video background
const placeholderImage = require('../assets/mainbackgroundvideo/placeholder.jpg');

const Hero = () => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const { isVisible, targetRef } = useIsVisible({
    rootMargin: '100px',
    threshold: 0.1
  }, true);
  
  // Get the global loading state
  const { resourceLoaded, isAppLoaded } = useLoading();
  
  // Get optimized animation settings based on device performance
  const { 
    devicePerformance,
    getAnimationSettings,
    getStaggerAmount
  } = useOptimizedAnimations();

  useEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(prefersReducedMotion.matches);

    // Listen for changes
    const handleMotionPreferenceChange = (event) => {
      setShouldReduceMotion(event.matches);
    };

    prefersReducedMotion.addEventListener('change', handleMotionPreferenceChange);

    return () => {
      prefersReducedMotion.removeEventListener('change', handleMotionPreferenceChange);
    };
  }, []);

  // Handle video loading
  const handleVideoLoaded = () => {
    setIsVideoLoaded(true);
    
    // Get the video reference after the component has rendered
    const videoElement = document.querySelector('.hero-video-element');
    if (videoElement) {
      videoRef.current = videoElement;
    }
  };

  const handleVideoError = () => {
    console.error('Error loading video');
    setVideoError(true);
    // Still notify the loading system to avoid blocking the app
    resourceLoaded('hero_video');
    setIsVideoLoaded(false);
  };

  return (
    <div id="home" ref={targetRef} className="relative w-full h-screen overflow-hidden">
      {/* Video Background with placeholder */}
      <div className="absolute top-0 left-0 w-full h-full">
        {/* Persistent dark overlay that's visible even before video loads */}
        <div className="absolute top-0 left-0 w-full h-full bg-black/75 z-10" />
        
        {/* Static background placeholder (always visible until video loads) */}
        <div className="absolute top-0 left-0 w-full h-full bg-secondary-900/90" />
        
        {/* Placeholder image that shows immediately */}
        <img 
          src={placeholderImage}
          alt="Background"
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-0' : 'opacity-100'}`}
        />
        
        <AnimatePresence>
          {!videoError && (
            <OptimizedVideo
              src={backgroundVideo}
              className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 hero-video-element ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
              autoPlay
              loop
              muted={true}
              playsInline
              preload="auto"
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
            transition={{ duration: shouldReduceMotion ? 0.5 : 1, delay: 0.2 }}
            className="text-center"
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg shadow-black"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Capturing Your Events,
              <br />
              <span className="text-primary-300 drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)]">Creating Memories</span>
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-white max-w-[800px] mx-auto mb-12 drop-shadow-md bg-black/10 py-2 px-4 rounded-lg backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Professional event photography and videography services that turn moments into lasting memories.
            </motion.p>

            {/* CTA Button */}
            <motion.div 
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
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
          delay: 1.2,
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