import React, { useRef, useEffect, useState } from 'react';

/**
 * Optimized Video component with lazy loading and adaptive quality
 */
export const OptimizedVideo = ({
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

    // Ensure proper muted state and volume
    video.muted = muted;
    video.volume = 1.0; // Set full volume by default

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, [isVisible, onLoaded, onError, muted]);

  // Handle adaptive playback quality based on network conditions
  useEffect(() => {
    if (!isVisible || !videoRef.current) return;
    
    // Check connection type if available
    if ('connection' in navigator) {
      const connection = navigator.connection;
      if (connection.effectiveType === 'slow-2g' || 
          connection.effectiveType === '2g' || 
          connection.saveData) {
        // For slow connections, reduce quality or disable autoplay
        videoRef.current.setAttribute('preload', 'none');
        videoRef.current.setAttribute('data-quality', 'low');
      }
    }
  }, [isVisible]);

  // Additional effect to handle mute state changes
  useEffect(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    video.muted = muted;
    
    // Ensure volume is properly set
    if (!muted) {
      video.volume = 1.0;
    }
  }, [muted]);

  // Determine video source based on the format
  const getVideoSources = () => {
    // Base video path without extension
    const basePath = src.substring(0, src.lastIndexOf('.'));
    
    return (
      <>
        <source src={`${basePath}.webm`} type="video/webm" />
        <source src={`${basePath}.mp4`} type="video/mp4" />
        {children}
      </>
    );
  };

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay={isVisible && autoPlay}
      loop={loop}
      muted={muted}
      playsInline={playsInline}
      preload={preload}
      poster={posterSrc}
      controls={false}
    >
      {isVisible && getVideoSources()}
    </video>
  );
};

/**
 * Hook to handle video playback optimization
 */
export const useVideoOptimization = (videoRef) => {
  useEffect(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    
    // Pause video when not visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (video.paused) video.play().catch(() => {});
          } else {
            if (!video.paused) video.pause();
          }
        });
      },
      { threshold: 0.2 }
    );
    
    observer.observe(video);
    
    return () => {
      observer.disconnect();
    };
  }, [videoRef]);
}; 