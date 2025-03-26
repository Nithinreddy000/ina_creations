import { useState, useEffect, createContext, useContext } from 'react';

// Create a context for loading state management
export const LoadingContext = createContext({
  isAppLoaded: false,
  loadingProgress: 0,
  registerResource: () => {},
  resourceLoaded: () => {},
  setInitialResourceCount: () => {},
});

// Values for prioritizing different types of assets
export const RESOURCE_PRIORITIES = {
  CRITICAL: 10,   // Must be loaded before showing content (hero images, main video)
  HIGH: 5,        // Should be loaded quickly (navigation elements, first viewport images)
  MEDIUM: 3,      // Important but not blocking (below-fold images)
  LOW: 1,         // Non-essential (footer images, secondary content)
};

// Custom hook to provide loading manager functionality
export const useLoadingManager = () => {
  const [resourceRegistry, setResourceRegistry] = useState(new Map());
  const [resourcesLoaded, setResourcesLoaded] = useState(0);
  const [totalResourceWeight, setTotalResourceWeight] = useState(0);
  const [loadedResourceWeight, setLoadedResourceWeight] = useState(0);
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Function to register a resource that needs to be loaded
  const registerResource = (id, priority = RESOURCE_PRIORITIES.MEDIUM) => {
    if (!resourceRegistry.has(id)) {
      const newRegistry = new Map(resourceRegistry);
      newRegistry.set(id, { loaded: false, priority });
      setResourceRegistry(newRegistry);
      setTotalResourceWeight(prev => prev + priority);
      return true;
    }
    return false;
  };

  // Function to mark a resource as loaded
  const resourceLoaded = (id) => {
    if (resourceRegistry.has(id) && !resourceRegistry.get(id).loaded) {
      const resource = resourceRegistry.get(id);
      const newRegistry = new Map(resourceRegistry);
      newRegistry.set(id, { ...resource, loaded: true });
      setResourceRegistry(newRegistry);
      setResourcesLoaded(prev => prev + 1);
      setLoadedResourceWeight(prev => prev + resource.priority);
      return true;
    }
    return false;
  };

  // Set a fixed number of resources to track (optional optimization)
  const setInitialResourceCount = (count) => {
    if (!initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  };

  // Calculate loading progress based on weighted priorities
  useEffect(() => {
    if (totalResourceWeight === 0) {
      // No resources registered yet
      setLoadingProgress(0);
      return;
    }
    
    // Calculate weighted progress
    const progress = Math.min(
      Math.floor((loadedResourceWeight / totalResourceWeight) * 100),
      99 // Cap at 99% until we explicitly set to 100%
    );
    
    setLoadingProgress(progress);
    
    // Check if all registered resources are loaded
    const allLoaded = Array.from(resourceRegistry.values()).every(resource => resource.loaded);
    
    // If all resources are loaded and we have at least some resources
    if (allLoaded && resourceRegistry.size > 0) {
      // Allow a slight delay for final transitions
      setTimeout(() => {
        setLoadingProgress(100);
        setTimeout(() => {
          setIsAppLoaded(true);
        }, 500); // Transition delay after reaching 100%
      }, 300);
    }
  }, [resourceRegistry, totalResourceWeight, loadedResourceWeight]);

  // Provide utility for preloading images
  const preloadImage = (src, id, priority = RESOURCE_PRIORITIES.MEDIUM) => {
    const resourceId = id || `img_${src}`;
    registerResource(resourceId, priority);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      
      img.onload = () => {
        resourceLoaded(resourceId);
        resolve(img);
      };
      
      img.onerror = (error) => {
        // Mark as loaded anyway to prevent blocking the app
        resourceLoaded(resourceId);
        reject(error);
      };
    });
  };

  // Utility for preloading videos
  const preloadVideo = (src, id, priority = RESOURCE_PRIORITIES.HIGH) => {
    const resourceId = id || `video_${src}`;
    registerResource(resourceId, priority);
    
    return new Promise((resolve, reject) => {
      // First try with fetch to check availability
      fetch(src, { method: 'HEAD' })
        .then(() => {
          const video = document.createElement('video');
          
          video.addEventListener('canplaythrough', () => {
            resourceLoaded(resourceId);
            resolve(video);
          }, { once: true });
          
          video.addEventListener('error', (error) => {
            // Mark as loaded anyway to prevent blocking the app
            resourceLoaded(resourceId);
            reject(error);
          }, { once: true });
          
          // Set a timeout to avoid blocking indefinitely
          const timeout = setTimeout(() => {
            resourceLoaded(resourceId);
            resolve(video); // Resolve anyway to avoid blocking
          }, 10000); // 10s timeout
          
          video.addEventListener('canplaythrough', () => {
            clearTimeout(timeout);
          }, { once: true });
          
          video.muted = true;
          video.preload = 'auto';
          video.src = src;
          video.load();
        })
        .catch(error => {
          // Mark as loaded to prevent blocking if the resource is unavailable
          resourceLoaded(resourceId);
          reject(error);
        });
    });
  };

  // Forced complete loading after a timeout
  // This prevents the app from being stuck on loading if some resources fail
  useEffect(() => {
    const forceCompleteTimeout = setTimeout(() => {
      if (!isAppLoaded && totalResourceWeight > 0) {
        console.warn('Force completing loading after timeout');
        setLoadingProgress(100);
        setTimeout(() => {
          setIsAppLoaded(true);
        }, 500);
      }
    }, 15000); // 15 second maximum loading time
    
    return () => clearTimeout(forceCompleteTimeout);
  }, [isAppLoaded, totalResourceWeight]);

  return {
    isAppLoaded,
    loadingProgress,
    registerResource,
    resourceLoaded,
    setInitialResourceCount,
    preloadImage,
    preloadVideo,
    RESOURCE_PRIORITIES,
  };
};

// Provider component for LoadingContext
export const LoadingProvider = ({ children }) => {
  const loadingManager = useLoadingManager();
  
  return (
    <LoadingContext.Provider value={loadingManager}>
      {children}
    </LoadingContext.Provider>
  );
};

// Hook to use the loading context
export const useLoading = () => useContext(LoadingContext); 