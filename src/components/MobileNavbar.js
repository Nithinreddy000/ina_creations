import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-scroll';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineHome, HiOutlineBriefcase, HiOutlinePhotograph, 
         HiOutlineUsers, HiOutlineInformationCircle, HiOutlineMail } from 'react-icons/hi';

const MobileNavbar = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isVisible, setIsVisible] = useState(false);
  const [isManualNavigation, setIsManualNavigation] = useState(false);
  const navRef = useRef(null);
  const rafRef = useRef(null);
  const timerRef = useRef(null);

  // Enhanced scroll detection with requestAnimationFrame for performance
  useEffect(() => {
    const checkScrollPosition = () => {
      // Show navbar after scrolling down slightly
      setIsVisible(window.scrollY > 100);
      
      // Don't update active section during manual navigation to prevent flickering
      if (!isManualNavigation) {
        const sections = ['home', 'services', 'portfolio', 'team', 'about', 'contact'];
        const currentScrollPos = window.scrollY;
        
        const threshold = window.innerHeight / 4;
        
        for (let i = sections.length - 1; i >= 0; i--) {
          const section = document.getElementById(sections[i]);
          if (section) {
            const offsetTop = section.offsetTop - threshold;
            if (currentScrollPos >= offsetTop) {
              setActiveSection(sections[i]);
              break;
            }
          }
        }
      }
    };

    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(checkScrollPosition);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    checkScrollPosition(); // Initial check
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isManualNavigation]);

  // Handle navigation click with proper state management
  const handleNavClick = (sectionId) => {
    // Prevent scroll detection from changing our active section during navigation
    setIsManualNavigation(true);
    setActiveSection(sectionId);
    
    // Reset the manual navigation flag after scrolling completes
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Allow enough time for the scroll animation to complete
    timerRef.current = setTimeout(() => {
      setIsManualNavigation(false);
    }, 1600); // Slightly longer than the duration of the scroll animation
  };

  // Navigation items with icons and tooltip texts
  const navItems = [
    { id: 'home', icon: <HiOutlineHome className="w-[18px] h-[18px]" />, text: 'Home' },
    { id: 'services', icon: <HiOutlineBriefcase className="w-[18px] h-[18px]" />, text: 'Services' },
    { id: 'portfolio', icon: <HiOutlinePhotograph className="w-[18px] h-[18px]" />, text: 'Portfolio' },
    { id: 'team', icon: <HiOutlineUsers className="w-[18px] h-[18px]" />, text: 'Team' },
    { id: 'about', icon: <HiOutlineInformationCircle className="w-[18px] h-[18px]" />, text: 'About' },
    { id: 'contact', icon: <HiOutlineMail className="w-[18px] h-[18px]" />, text: 'Contact' },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed bottom-0 left-0 right-0 md:hidden z-[1000] px-3 pb-3"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          ref={navRef}
        >
          <motion.div 
            className="flex justify-between items-center py-3 px-4 rounded-2xl bg-secondary-100/90 backdrop-blur-xl border border-white/10 shadow-[0_0_25px_rgba(0,0,0,0.5)] relative overflow-hidden"
            layoutId="mobileNavContainer"
          >
            {/* Gradient overlay for premium look */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
            
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.id}
                spy={false} // Disable the spy feature to prevent competing with our custom logic
                smooth={true}
                duration={1500}
                offset={item.id === 'home' ? 0 : -100}
                className="relative flex flex-col items-center justify-center p-2 group"
                onClick={() => handleNavClick(item.id)}
              >
                <motion.div
                  className={`relative z-10 p-2 rounded-xl transition-all duration-500 ease-out
                    ${activeSection === item.id 
                      ? 'text-primary-700 scale-110' 
                      : 'text-primary-900/60 hover:text-primary-900/90'}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.icon}
                  
                  {/* Label tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                    <div className="bg-primary-700/80 text-white text-xs py-1 px-2 rounded">
                      {item.text}
                    </div>
                    <div className="w-2 h-2 bg-primary-700/80 transform rotate-45 absolute -bottom-[3px] left-1/2 -translate-x-1/2"></div>
                  </div>
                </motion.div>
                
                {/* Active indicator - glowing dot */}
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-[2px] left-1/2 transform -translate-x-1/2 w-[4px] h-[4px] bg-primary-700 rounded-full pulse-glow"
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                
                {/* Active item background glow effect */}
                {activeSection === item.id && (
                  <motion.div
                    layoutId="navBackgroundGlow"
                    className="absolute inset-0 bg-primary-700/10 rounded-xl z-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </Link>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileNavbar; 