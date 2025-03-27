import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePerformance } from '../utils/performanceOptimization';

// Create a context for performance settings
const PerformanceContext = createContext();

export const usePerformanceContext = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformanceContext must be used within a PerformanceProvider');
  }
  return context;
};

export const PerformanceProvider = ({ children }) => {
  // Performance-related states
  const [connectionType, setConnectionType] = useState('4g');
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  const [isLowMemory, setIsLowMemory] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(1); // Full by default
  const [isBatteryCharging, setIsBatteryCharging] = useState(true);
  const [devicePerformance, setDevicePerformance] = useState('medium');

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => {
      setShouldReduceMotion(prefersReducedMotion.matches);
    };
    
    updateMotionPreference();
    prefersReducedMotion.addEventListener('change', updateMotionPreference);
    
    // Check connection type
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      const updateConnectionType = () => {
        setConnectionType(connection.effectiveType);
        // Save data mode indicates user wants to reduce data usage
        if (connection.saveData) {
          setIsLowEndDevice(true);
        }
      };
      
      updateConnectionType();
      connection.addEventListener('change', updateConnectionType);
    }
    
    // Check device memory
    if ('deviceMemory' in navigator) {
      setIsLowMemory(navigator.deviceMemory < 4); // Less than 4GB is considered low
      setIsLowEndDevice(navigator.deviceMemory < 2); // Less than 2GB is very constrained
    }
    
    // Check battery status
    const checkBatteryStatus = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await navigator.getBattery();
          
          const updateBatteryInfo = () => {
            setBatteryLevel(battery.level);
            setIsBatteryCharging(battery.charging);
            
            // Consider low power mode when battery is below 20% and not charging
            setIsLowEndDevice(
              prevValue => prevValue || (battery.level < 0.2 && !battery.charging)
            );
          };
          
          updateBatteryInfo();
          
          battery.addEventListener('levelchange', updateBatteryInfo);
          battery.addEventListener('chargingchange', updateBatteryInfo);
          
          return () => {
            battery.removeEventListener('levelchange', updateBatteryInfo);
            battery.removeEventListener('chargingchange', updateBatteryInfo);
          };
        } catch (error) {
          console.log('Battery API not available');
        }
      }
    };
    
    checkBatteryStatus();
    
    // Run a quick performance test
    const checkDevicePerformance = () => {
      try {
        const start = performance.now();
        let result = 0;
        
        // Simple benchmark calculation
        for (let i = 0; i < 1000000; i++) {
          result += Math.sqrt(i);
        }
        
        const end = performance.now();
        const duration = end - start;
        
        // Classify performance based on benchmark
        if (duration < 40) {
          setDevicePerformance('high');
        } else if (duration < 100) {
          setDevicePerformance('medium');
        } else {
          setDevicePerformance('low');
          setIsLowEndDevice(true);
        }
      } catch (error) {
        console.error('Performance check failed', error);
      }
    };
    
    // Run performance check after page load
    if (document.readyState === 'complete') {
      setTimeout(checkDevicePerformance, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(checkDevicePerformance, 1000);
      });
    }
    
    return () => {
      prefersReducedMotion.removeEventListener('change', updateMotionPreference);
      
      if ('connection' in navigator) {
        navigator.connection.removeEventListener('change', () => {});
      }
    };
  }, []);
  
  // Helper function to determine if high-quality media should be loaded
  const shouldLoadHighQualityMedia = () => {
    // Don't load high quality on slow connections or low-end devices
    if (connectionType === 'slow-2g' || connectionType === '2g') return false;
    if (isLowEndDevice) return false;
    if (batteryLevel < 0.2 && !isBatteryCharging) return false;
    
    return true;
  };
  
  // Helper function to get appropriate image quality
  const getImageQuality = () => {
    if (connectionType === 'slow-2g' || connectionType === '2g') return 'low';
    if (isLowEndDevice || (batteryLevel < 0.2 && !isBatteryCharging)) return 'medium';
    return 'high';
  };
  
  // Helper function for animation complexity
  const getAnimationComplexity = () => {
    if (shouldReduceMotion) return 'minimal';
    if (isLowEndDevice || devicePerformance === 'low') return 'reduced';
    if (devicePerformance === 'medium') return 'standard';
    return 'full';
  };
  
  // Provide all performance settings to components
  const value = {
    connectionType,
    isLowEndDevice,
    shouldReduceMotion,
    isLowMemory,
    batteryLevel,
    isBatteryCharging,
    devicePerformance,
    shouldLoadHighQualityMedia,
    getImageQuality,
    getAnimationComplexity
  };
  
  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}; 