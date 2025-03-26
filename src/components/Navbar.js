import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo/logo.png';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [scrollingDown, setScrollingDown] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isManualNavigation, setIsManualNavigation] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const rafRef = useRef(null);
  const timerRef = useRef(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Optimized scroll handler with requestAnimationFrame for better performance
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollPosition = window.scrollY;
          const isScrollingDown = scrollPosition > lastScrollY;
          
          if (scrollPosition > 10) {
            if (!scrolled) setScrolled(true);
          } else {
            if (scrolled) setScrolled(false);
          }
          
          setScrollingDown(isScrollingDown);
          lastScrollY = scrollPosition;
          ticking = false;
          
          // Update active section based on scroll position, but only if not during manual navigation
          if (!isManualNavigation) {
            const sections = ['home', 'services', 'portfolio', 'team', 'about', 'contact'];
            const threshold = window.innerHeight / 4;
            
            for (let i = sections.length - 1; i >= 0; i--) {
              const section = document.getElementById(sections[i]);
              if (section) {
                const offsetTop = section.offsetTop - threshold;
                if (scrollPosition >= offsetTop) {
                  setActiveSection(sections[i]);
                  break;
                }
              }
            }
          }
        });
        
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [scrolled, isManualNavigation]);

  // Enhanced smooth scrolling
  const handleMenuClick = (section) => {
    // Prevent scroll detection from changing active section during navigation
    setIsManualNavigation(true);
    setActiveSection(section);
    
    // Reset after scroll animation completes
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = setTimeout(() => {
      setIsManualNavigation(false);
    }, 1600); // Slightly longer than the scroll animation duration
  };

  // Logo animation variants
  const logoVariants = {
    hover: {
      scale: 1.05,
      rotate: [0, -2, 2, -2, 0],
      transition: {
        rotate: {
          repeat: Infinity,
          duration: 1.5
        }
      }
    }
  };

  // Mobile logo floating animation
  const mobileLogoVariants = {
    initial: { y: 0 },
    animate: { 
      y: [0, -5, 0, -3, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Navigation items
  const navItems = [
    { to: "home", label: "Home", offset: 0 },
    { to: "services", label: "Services", offset: -100 },
    { to: "portfolio", label: "Portfolio", offset: -100 },
    { to: "team", label: "Team", offset: -100 },
    { to: "about", label: "About", offset: -100 },
    { to: "contact", label: "Contact", isButton: true, offset: -100 }
  ];

  return (
    <motion.nav 
      className={`fixed w-full flex justify-between items-center px-4 md:px-6 z-[1001] transition-all duration-500 max-w-[100vw] left-0 right-0 overflow-hidden
        ${scrolled 
          ? `bg-secondary-100/95 backdrop-blur-xl ${scrollingDown ? 'h-[90px]' : 'h-[90px]'} shadow-lg shadow-black/20` 
          : 'bg-black/30 h-[100px] backdrop-blur-sm'}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div 
        className={`logo transition-all duration-300 ${scrolled ? 'mt-1' : ''}`}
        onMouseEnter={() => setIsLogoHovered(true)}
        onMouseLeave={() => setIsLogoHovered(false)}
      >
        <Link
          to="home"
          spy={false}
          smooth={true}
          duration={1500}
          offset={0}
          className="cursor-pointer block"
          onClick={() => handleMenuClick('home')}
        >
          {/* Desktop logo */}
          <div className="hidden md:block relative">
            {/* Background blend overlay for desktop */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 rounded-lg backdrop-blur-sm z-0"
              animate={{
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Glow effect behind desktop logo */}
            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-primary-700/50 via-primary-800/30 to-primary-700/50 rounded-lg blur-lg opacity-50"
              animate={{
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <motion.div
              initial="initial"
              animate="animate"
              variants={mobileLogoVariants}
              className="relative flex justify-center"
            >
              <motion.div
                className="relative overflow-hidden rounded-lg"
                style={{
                  width: scrolled ? '220px' : '260px',
                  height: scrolled ? '70px' : '80px',
                  transition: 'all 0.5s ease'
                }}
                whileHover={{
                  boxShadow: "0 0 20px rgba(160, 67, 10, 0.5)"
                }}
              >
                <motion.img 
                  src={logo} 
                  alt="Ina Creations Logo" 
                  className={`w-full h-full object-contain transition-all duration-500 z-10 ${
                    isLogoHovered ? 'filter brightness-110' : ''
                  }`}
                  animate={{
                    scale: isLogoHovered ? 1.03 : 1
                  }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  whileHover="hover"
                  variants={logoVariants}
                />
                
                {/* Subtle border effect */}
                <motion.div
                  className="absolute inset-0 border border-primary-700/30 rounded-lg pointer-events-none"
                  animate={{
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
              
              {!scrolled && (
                <motion.div
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3/4 h-[2px]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: 1,
                    ease: "easeOut"
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-r from-transparent via-primary-700 to-transparent" />
                </motion.div>
              )}
            </motion.div>
          </div>
          
          {/* Mobile logo with special effects */}
          <div className="md:hidden relative w-full">
            {/* Background blend overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 rounded-lg backdrop-blur-sm z-0"
              animate={{
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Glow effect behind logo */}
            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-primary-700/50 via-primary-800/30 to-primary-700/50 rounded-lg blur-lg opacity-50"
              animate={{
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <motion.div
              initial="initial"
              animate="animate"
              variants={mobileLogoVariants}
              className="relative flex justify-center"
            >
              <motion.div
                className="relative overflow-hidden rounded-lg"
                style={{
                  width: scrolled ? '180px' : '220px',
                  height: scrolled ? '60px' : '70px',
                  transition: 'all 0.5s ease'
                }}
                whileHover={{
                  boxShadow: "0 0 15px rgba(160, 67, 10, 0.5)"
                }}
              >
                <motion.img 
                  src={logo} 
                  alt="Ina Creations Logo" 
                  className={`w-full h-full object-contain transition-all duration-500 z-10 ${
                    isLogoHovered ? 'filter brightness-110' : ''
                  }`}
                  animate={{
                    scale: isLogoHovered ? 1.03 : 1
                  }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
                
                {/* Subtle border effect */}
                <motion.div
                  className="absolute inset-0 border border-primary-700/30 rounded-lg pointer-events-none"
                  animate={{
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
              
              {!scrolled && (
                <motion.div
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3/4 h-[2px]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: 1,
                    ease: "easeOut"
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-r from-transparent via-primary-700 to-transparent" />
                </motion.div>
              )}
            </motion.div>
          </div>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-4">
        {navItems.map((item, index) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link
              to={item.to}
              spy={false}
              smooth={true}
              duration={1500}
              offset={item.offset}
              className={`
                relative px-4 py-2 cursor-pointer transition-all duration-500
                ${item.isButton 
                  ? "ml-4 bg-primary-700 text-white font-semibold rounded-full hover:bg-primary-800 hover:scale-105 shadow-lg shadow-primary-700/20"
                  : scrolled
                    ? "text-primary-900 hover:text-primary-700 font-medium group"
                    : "text-white hover:text-primary-300 font-medium group drop-shadow-md"}
              `}
              onClick={() => handleMenuClick(item.to)}
            >
              <span className={`relative z-10 ${activeSection === item.to && !item.isButton ? 'font-bold' : ''}`}>
                {item.label}
              </span>
              {!item.isButton && (
                <motion.span
                  className={`absolute bottom-0 left-0 w-full h-[2px] ${scrolled ? 'bg-primary-700' : 'bg-primary-300'} origin-left transform scale-x-0 transition-transform duration-500 group-hover:scale-x-100`}
                  initial={false}
                  animate={activeSection === item.to ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </Link>
          </motion.div>
        ))}

        {/* Admin Login Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: navItems.length * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RouterLink
            to="/admin"
            className={`ml-4 px-6 py-2.5 ${scrolled ? 'text-gray-700 bg-secondary-100/70 border-gray-300/50' : 'text-white bg-black/30 border-white/30'} hover:text-primary-700 border hover:border-primary-700 rounded-full transition-all duration-300 hover:bg-primary-700/10 hover:shadow-lg hover:shadow-primary-700/10 backdrop-blur-sm flex items-center gap-2 font-medium`}
          >
            <span className="text-sm">Login</span>
          </RouterLink>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar; 