import React from 'react';

/**
 * Optimized Image component that automatically selects the best format
 * and handles lazy loading
 */
export const OptimizedImage = ({ 
  src, 
  alt, 
  className, 
  width, 
  height, 
  loading = 'lazy',
  sizes = '100vw'
}) => {
  // Check if we already have a WebP version
  const hasWebP = src.includes('.webp');
  
  // If the image is already WebP, use it directly
  if (hasWebP) {
    return (
      <img 
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={loading}
        sizes={sizes}
      />
    );
  }
  
  // For other formats, use picture element with WebP fallback
  const srcBase = src.substring(0, src.lastIndexOf('.'));
  const srcExt = src.substring(src.lastIndexOf('.'));
  const webpSrc = `${srcBase}.webp`;
  
  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <source srcSet={src} type={`image/${srcExt.replace('.', '')}`} />
      <img 
        src={src} 
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={loading}
        sizes={sizes}
      />
    </picture>
  );
};

/**
 * Function to determine appropriate image size based on viewport
 */
export const getResponsiveImageSrc = (imagePath, size = 'medium') => {
  const sizeSuffixes = {
    small: '-sm',
    medium: '-md',
    large: '-lg',
    xlarge: '-xl'
  };
  
  const basePath = imagePath.substring(0, imagePath.lastIndexOf('.'));
  const extension = imagePath.substring(imagePath.lastIndexOf('.'));
  
  return `${basePath}${sizeSuffixes[size]}${extension}`;
};

/**
 * Hook to determine appropriate image size based on screen width
 */
export const useResponsiveImageSize = () => {
  const [size, setSize] = React.useState('medium');
  
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setSize('small');
      } else if (width < 1024) {
        setSize('medium');
      } else if (width < 1280) {
        setSize('large');
      } else {
        setSize('xlarge');
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize on mount
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return size;
}; 