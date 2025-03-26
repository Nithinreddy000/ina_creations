# Media Optimization Guide for INA Creations

This guide explains how to use the performance optimization features implemented in this website to ensure smooth performance across all devices.

## Table of Contents

1. [Image Optimization](#image-optimization)
2. [Video Optimization](#video-optimization)
3. [Animation Optimization](#animation-optimization)
4. [Performance Provider](#performance-provider)
5. [Best Practices](#best-practices)

## Image Optimization

### Using the OptimizedImage Component

The `OptimizedImage` component automatically selects the best image format based on browser support and handles responsive image sizes.

```jsx
import { OptimizedImage } from '../utils/imageOptimization';

// Basic usage
<OptimizedImage 
  src="/path/to/image.jpg" 
  alt="Description" 
  width={800} 
  height={600} 
/>

// With additional options
<OptimizedImage 
  src="/path/to/image.jpg" 
  alt="Description" 
  width={800} 
  height={600}
  loading="eager" // Use 'eager' for above-the-fold images
  sizes="(max-width: 768px) 100vw, 50vw"
  className="rounded-lg shadow-md"
/>
```

### Using the Responsive Image Utilities

```jsx
import { useResponsiveImageSize, getResponsiveImageSrc } from '../utils/imageOptimization';

const MyComponent = () => {
  // This hook returns the appropriate size based on screen width
  const size = useResponsiveImageSize();
  
  // Get the appropriate image source for the current screen size
  const optimizedImageSrc = getResponsiveImageSrc('/path/to/image.jpg', size);
  
  return <img src={optimizedImageSrc} alt="Description" />;
};
```

### Running the Image Optimization Script

To convert your existing images to optimized formats:

1. Install dependencies: `npm install`
2. Run the optimization script: `npm run optimize-images`

This will generate WebP and AVIF versions of your images in multiple sizes.

## Video Optimization

### Using the OptimizedVideo Component

The `OptimizedVideo` component provides lazy loading and adaptive quality for videos:

```jsx
import { OptimizedVideo } from '../utils/videoOptimization';

// Basic usage
<OptimizedVideo 
  src="/path/to/video.mp4"
  posterSrc="/path/to/poster.jpg" 
  className="w-full h-auto"
/>

// With additional options
<OptimizedVideo 
  src="/path/to/video.mp4"
  posterSrc="/path/to/poster.jpg"
  className="w-full h-auto rounded-lg"
  autoPlay={true}
  loop={true}
  muted={true}
  playsInline={true}
  preload="metadata"
  priority={false} // Set to true for above-the-fold videos
  onLoaded={() => console.log('Video loaded')}
  onError={(e) => console.error('Video error', e)}
/>
```

### Optimizing Video Playback

```jsx
import { useVideoOptimization } from '../utils/videoOptimization';
import { useRef } from 'react';

const MyComponent = () => {
  const videoRef = useRef(null);
  
  // This hook pauses the video when it's not visible in viewport
  useVideoOptimization(videoRef);
  
  return <video ref={videoRef} src="/path/to/video.mp4" />;
};
```

## Animation Optimization

### Using the Animation Optimization Hooks

```jsx
import { useOptimizedAnimations, animationVariants } from '../utils/animationOptimization';
import { motion } from 'framer-motion';

const MyAnimatedComponent = () => {
  const { 
    shouldReduceMotion,
    devicePerformance,
    getAnimationSettings,
    getStaggerAmount
  } = useOptimizedAnimations();
  
  // Get animation settings based on device capability
  const animationSettings = getAnimationSettings('medium');
  
  // Use different animation variants based on device performance
  const variant = devicePerformance === 'low' 
    ? animationVariants.lowPerformance.fadeIn
    : animationVariants.fadeIn;
  
  return (
    <motion.div
      initial={variant.hidden}
      animate={variant.visible}
      transition={animationSettings.transition}
    >
      Animated content
    </motion.div>
  );
};
```

## Performance Provider

The `PerformanceProvider` component provides global performance settings based on device capabilities:

```jsx
import { usePerformance } from './components/PerformanceProvider';

const MyComponent = () => {
  const { 
    connectionType,
    isLowEndDevice, 
    shouldReduceMotion,
    devicePerformance,
    shouldLoadHighQualityMedia,
    getImageQuality,
    getAnimationComplexity
  } = usePerformance();
  
  // Example usage
  return (
    <div>
      {shouldLoadHighQualityMedia() ? (
        <img src="/path/to/high-quality-image.jpg" alt="High quality" />
      ) : (
        <img src="/path/to/low-quality-image.jpg" alt="Low quality" />
      )}
      
      {shouldReduceMotion ? (
        <div>Static content for users who prefer reduced motion</div>
      ) : (
        <div className="animate-bounce">Animated content</div>
      )}
    </div>
  );
};
```

## Best Practices

1. **Always provide image dimensions**: This prevents layout shifts as images load
2. **Use WebP format**: Convert JPG and PNG to WebP for better compression
3. **Lazy load below-the-fold images**: Use `loading="lazy"` for images not visible on initial load
4. **Provide fallbacks**: Always include fallbacks for older browsers
5. **Respect user preferences**: Check for reduced motion and data-saver mode
6. **Optimize video delivery**:
   - Use compressed formats (MP4 with H.264 or WebM)
   - Provide appropriate poster images
   - Consider removing autoplay for data-conscious users
7. **Reduce animation complexity** on low-end devices
8. **Test on various devices** and connection speeds

## Additional Resources

- [Web.dev Image Optimization Guide](https://web.dev/learn/performance/image-performance)
- [TinyPNG for image compression](https://tinypng.com/)
- [Calibre App Blog on Image Optimization](https://calibreapp.com/blog/image-optimisation-guide) 