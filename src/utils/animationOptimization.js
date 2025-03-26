import { useEffect, useState } from 'react';

/**
 * Hook to reduce animation complexity based on device performance and preferences
 */
export const useOptimizedAnimations = () => {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  const [isLowPowerMode, setIsLowPowerMode] = useState(false);
  
  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => {
      setShouldReduceMotion(prefersReducedMotion.matches);
    };
    
    updateMotionPreference();
    prefersReducedMotion.addEventListener('change', updateMotionPreference);
    
    // Try to detect low power mode (limited support)
    const checkBatteryStatus = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await navigator.getBattery();
          setIsLowPowerMode(battery.charging === false && battery.level < 0.2);
          
          const updateBatteryStatus = () => {
            setIsLowPowerMode(battery.charging === false && battery.level < 0.2);
          };
          
          battery.addEventListener('levelchange', updateBatteryStatus);
          battery.addEventListener('chargingchange', updateBatteryStatus);
          
          return () => {
            battery.removeEventListener('levelchange', updateBatteryStatus);
            battery.removeEventListener('chargingchange', updateBatteryStatus);
          };
        } catch (error) {
          console.log('Battery status API not available');
        }
      }
    };
    
    checkBatteryStatus();
    
    return () => {
      prefersReducedMotion.removeEventListener('change', updateMotionPreference);
    };
  }, []);
  
  // Get optimized animation settings
  const getAnimationSettings = (complexity = 'medium') => {
    // If user prefers reduced motion, use minimal animations
    if (shouldReduceMotion) {
      return {
        transition: { duration: 0.1 },
        animate: { opacity: 1 },
        initial: { opacity: 0 },
        // Minimal animation effects
        useSimpleAnimations: true
      };
    }
    
    // If device is in low power mode, reduce animation complexity
    if (isLowPowerMode) {
      return {
        transition: { duration: 0.3 },
        // Reduced effects
        useModerateAnimations: true
      };
    }
    
    // Normal animation settings based on requested complexity
    const complexitySettings = {
      low: {
        transition: { duration: 0.3 },
        // Basic animations only
        useBasicAnimations: true
      },
      medium: {
        transition: { duration: 0.5 },
        // Standard animations
        useStandardAnimations: true
      },
      high: {
        transition: { duration: 0.7, type: 'spring', bounce: 0.3 },
        // Full animations with effects
        useAdvancedAnimations: true
      }
    };
    
    return complexitySettings[complexity] || complexitySettings.medium;
  };
  
  // Check device performance to further optimize animations
  const [devicePerformance, setDevicePerformance] = useState('medium');
  
  useEffect(() => {
    const checkDevicePerformance = () => {
      try {
        const start = performance.now();
        let result = 0;
        
        // Simple benchmark - do some calculations
        for (let i = 0; i < 1000000; i++) {
          result += Math.sqrt(i);
        }
        
        const end = performance.now();
        const duration = end - start;
        
        // Classify performance based on benchmark duration
        if (duration < 40) {
          setDevicePerformance('high');
        } else if (duration < 100) {
          setDevicePerformance('medium');
        } else {
          setDevicePerformance('low');
        }
      } catch (error) {
        console.error('Performance check failed', error);
        setDevicePerformance('medium'); // Default to medium on error
      }
    };
    
    // Run the performance check after the page has loaded
    if (document.readyState === 'complete') {
      checkDevicePerformance();
    } else {
      window.addEventListener('load', () => {
        // Delay slightly to ensure page is fully rendered
        setTimeout(checkDevicePerformance, 1000);
      });
    }
  }, []);
  
  // The stagger amount for sequential animations - reduce for lower performance
  const getStaggerAmount = () => {
    if (shouldReduceMotion) return 0.05;
    if (isLowPowerMode || devicePerformance === 'low') return 0.1;
    if (devicePerformance === 'medium') return 0.15;
    return 0.2; // For high performance devices
  };
  
  return {
    shouldReduceMotion,
    isLowPowerMode,
    devicePerformance,
    getAnimationSettings,
    getStaggerAmount
  };
};

/**
 * Animation variants for common UI elements with performance optimization
 */
export const animationVariants = {
  // Fade in animation
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  
  // Slide in from bottom
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  },
  
  // Scale in
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  },
  
  // Optimized staggered children animations
  staggerChildren: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  
  // Performance-optimized versions (less CPU intensive)
  lowPerformance: {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.2 } }
    },
    slideUp: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.2 } }
    },
    scaleIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.2 } }
    }
  }
}; 