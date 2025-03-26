import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '../utils/loadingManager';
import logo from '../assets/logo/logo.png';

const LoadingScreen = () => {
  const { isAppLoaded, loadingProgress } = useLoading();

  // Animation constants for smoother performance
  const fadeTransition = { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] };
  const progressTransition = { duration: 0.3, ease: "easeOut" };

  // Handles the finish animation after loading completes
  return (
    <AnimatePresence mode="wait">
      {!isAppLoaded && (
        <motion.div
          key="loading-screen"
          className="fixed inset-0 z-[9999] bg-secondary-100 flex flex-col items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fadeTransition}
        >
          <div className="w-full max-w-md px-4 text-center">
            {/* Logo Animation */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-8 relative mx-auto w-48 h-48 flex items-center justify-center"
            >
              {/* Pulsing background for logo */}
              <motion.div
                className="absolute inset-0 rounded-full bg-primary-700/20 blur-xl"
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              <div className="relative">
                <img 
                  src={logo} 
                  alt="INA Creations" 
                  className="w-full object-contain relative z-10"
                />
                
                {/* Subtle light effect */}
                <motion.div 
                  className="absolute -inset-2 bg-gradient-to-tr from-primary-700/20 to-white/30 rounded-full blur-md z-0"
                  animate={{ 
                    rotate: 360,
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                    opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                />
              </div>
            </motion.div>

            {/* Loading Message */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ...fadeTransition }}
              className="text-4xl font-bold text-primary-900 mb-4"
            >
              Loading
            </motion.h1>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-secondary-200 rounded-full overflow-hidden mb-8">
              <motion.div
                className="h-full bg-primary-700"
                initial={{ width: "0%" }}
                animate={{ width: `${loadingProgress}%` }}
                transition={progressTransition}
              />
            </div>

            {/* Progress Percentage */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, ...fadeTransition }}
              className="text-xl text-primary-800"
            >
              {loadingProgress < 100 
                ? `${Math.round(loadingProgress)}% Complete` 
                : 'Welcome to INA Creations'}
            </motion.p>

            {/* Loading Status Message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, ...fadeTransition }}
              className="text-primary-800/80 mt-2 text-sm"
            >
              {loadingProgress < 50 
                ? 'Preparing resources...' 
                : loadingProgress < 80 
                  ? 'Loading media assets...' 
                  : loadingProgress < 95 
                    ? 'Finalizing...' 
                    : 'Entering the World of Camera...'}
            </motion.p>
            
            {/* Floating elements for visual interest */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-primary-700/20"
                  style={{
                    width: Math.random() * 60 + 20,
                    height: Math.random() * 60 + 20,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    x: [0, Math.random() * 20 - 10, 0],
                    opacity: [0.1, 0.3, 0.1]
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen; 