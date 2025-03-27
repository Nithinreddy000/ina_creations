import React, { useState, useEffect } from 'react';
import { usePerformanceContext } from './PerformanceProvider';
import { motion } from 'framer-motion';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  priority = false,
  sizes = '100vw'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { getImageQuality, shouldLoadHighQualityMedia } = usePerformanceContext();
  
  // Generate responsive image sizes
  const getResponsiveSrc = (originalSrc, quality) => {
    if (!originalSrc) return '';
    
    const basePath = originalSrc.substring(0, originalSrc.lastIndexOf('.'));
    const extension = originalSrc.substring(originalSrc.lastIndexOf('.'));
    
    // For low-end devices or slow connections, use smaller images
    if (quality === 'low') {
      return `${basePath}-sm${extension}`;
    } else if (quality === 'medium') {
      return `${basePath}-md${extension}`;
    }
    
    return originalSrc;
  };
  
  const quality = getImageQuality();
  const imageSrc = getResponsiveSrc(src, quality);
  
  useEffect(() => {
    if (priority) {
      setIsLoaded(true);
    }
  }, [priority]);
  
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading={priority ? 'eager' : 'lazy'}
        sizes={sizes}
        onLoad={() => setIsLoaded(true)}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-copper-100 animate-pulse" />
      )}
    </motion.div>
  );
};

export default OptimizedImage; 