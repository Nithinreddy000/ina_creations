import React, { useRef, useEffect, useState } from 'react';
import { usePerformanceContext } from './PerformanceProvider';
import { motion } from 'framer-motion';

const OptimizedVideo = ({
  src,
  posterSrc,
  className,
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  preload = 'metadata',
  onLoaded,
  onError,
  priority = false,
  children
}) => {
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { shouldLoadHighQualityMedia, getAnimationComplexity } = usePerformanceContext();

  useEffect(() => {
    // If priority is true, we load immediately without visibility check
    if (priority) {
      setIsVisible(true);
      return;
    }

    // Setup Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px 0px', threshold: 0.01 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.disconnect();
      }
    };
  }, [priority]);

  useEffect(() => {
    if (!isVisible || !videoRef.current) return;

    const video = videoRef.current;

    const handleLoadedData = () => {
      setHasLoaded(true);
      if (onLoaded) onLoaded();
    };

    const handleError = (e) => {
      console.error('Error loading video:', e);
      if (onError) onError(e);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, [isVisible, onLoaded, onError]);

  // Determine video quality based on device performance
  const videoQuality = shouldLoadHighQualityMedia() ? 'high' : 'low';
  const videoSrc = `${src}?q=${videoQuality}`;

  // Get animation settings based on device performance
  const animationComplexity = getAnimationComplexity();
  const animationSettings = {
    minimal: { duration: 0.2 },
    reduced: { duration: 0.3 },
    standard: { duration: 0.5 },
    full: { duration: 0.5, y: 20 }
  };

  return (
    <motion.div
      ref={videoRef}
      className={`relative ${className}`}
      initial={{ opacity: 0, ...(animationComplexity === 'full' && { y: 20 }) }}
      animate={{ opacity: hasLoaded ? 1 : 0, y: 0 }}
      transition={animationSettings[animationComplexity]}
    >
      {isVisible && (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          className="w-full h-full object-cover"
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          preload={preload}
        />
      )}
      {!hasLoaded && (
        <div className="absolute inset-0 bg-copper-100 animate-pulse" />
      )}
      {children}
    </motion.div>
  );
};

export default OptimizedVideo; 