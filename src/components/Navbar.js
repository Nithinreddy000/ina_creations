import React, { useState, useEffect } from 'react';
import { Link } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollingDown, setScrollingDown] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Handle scroll effect with debounce
  useEffect(() => {
    let timeoutId;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        const scrollPosition = window.scrollY;
        const isScrollingDown = scrollPosition > lastScrollY;
        
        if (scrollPosition > 5) {
          if (!scrolled) setScrolled(true);
        } else {
          if (scrolled) setScrolled(false);
        }
        
        setScrollingDown(isScrollingDown);
        lastScrollY = scrollPosition;
      }, 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [scrolled]);

  // Handle menu item click with smooth transition
  const handleMenuClick = (section) => {
    setActiveSection(section);
    if (isOpen) {
      setTimeout(() => {
        setIsOpen(false);
      }, 800);
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
    <>
      {/* Mobile Menu Button - Moved outside nav for highest z-index */}
      <div className={`fixed right-6 md:hidden z-[9999] transition-all duration-300 ${scrolled ? (scrollingDown ? 'top-11' : 'top-7') : 'top-7'}`}>
        <motion.button
          className="w-10 h-10 flex items-center justify-center"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, rotate: 180 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -180 }}
                transition={{ duration: 0.3 }}
                className="text-white absolute inset-0 flex items-center justify-center"
              >
                <FaTimes size={28} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ opacity: 0, rotate: -180 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 180 }}
                transition={{ duration: 0.3 }}
                className="text-white absolute inset-0 flex items-center justify-center"
              >
                <FaBars size={28} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <nav className={`fixed w-full flex justify-between items-center px-6 z-[1001] transition-all duration-300 
        ${scrolled 
          ? `bg-black/90 backdrop-blur-lg ${scrollingDown ? 'h-[100px]' : 'h-[100px]'}` 
          : 'bg-transparent h-[100px]'}`}>
        <div className={`logo transition-all duration-300 ${scrolled ? (scrollingDown ? '-ml-9 mt-5' : '-ml-10') : '-ml-10'}`}>
          <Link
            to="home"
            spy={true}
            smooth={true}
            duration={800}
            offset={0}
            className="cursor-pointer"
            onClick={() => handleMenuClick('home')}
          >
            <img 
              src={logo} 
              alt="Ina Creations Logo" 
              className={`transition-all duration-300 ${scrolled ? (scrollingDown ? 'h-40' : 'h-48') : 'h-48'} -ml-4`} 
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item, index) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={item.to}
                spy={true}
                smooth={true}
                duration={1000}
                offset={item.offset}
                className={`
                  relative px-4 py-2 cursor-pointer transition-all duration-500
                  ${item.isButton 
                    ? "ml-4 bg-[#ff6d6d] text-white rounded-full hover:bg-[#ff5555] hover:scale-105 shadow-lg shadow-[#ff6d6d]/20"
                    : "text-white hover:text-[#ff6d6d] group"}
                `}
                onClick={() => handleMenuClick(item.to)}
              >
                <span className="relative z-10">{item.label}</span>
                {!item.isButton && (
                  <motion.span
                    className="absolute bottom-0 left-0 w-full h-[2px] bg-[#ff6d6d] origin-left transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                    initial={false}
                    animate={activeSection === item.to ? { scaleX: 1 } : { scaleX: 0 }}
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
              className="ml-4 px-6 py-2.5 text-gray-300 bg-gray-800/50 hover:text-white border border-gray-700/50 hover:border-[#ff6d6d] rounded-full transition-all duration-300 hover:bg-[#ff6d6d]/10 hover:shadow-lg hover:shadow-[#ff6d6d]/10 backdrop-blur-sm flex items-center gap-2"
            >
              <span className="text-sm font-medium">Login</span>
            </RouterLink>
          </motion.div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/95 backdrop-blur-lg md:hidden z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="h-screen flex flex-col items-center justify-center gap-6 pt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {navItems.map((item, index) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="w-full max-w-[250px] px-6"
                >
                  <Link
                    to={item.to}
                    spy={true}
                    smooth={true}
                    duration={800}
                    offset={item.offset}
                    onClick={() => handleMenuClick(item.to)}
                    className={`
                      block text-center py-3 px-8
                      ${item.isButton
                        ? "bg-[#ff6d6d] text-white text-xl rounded-full hover:bg-[#ff5555] transform hover:scale-105 transition-all duration-300 shadow-lg shadow-[#ff6d6d]/20"
                        : "text-3xl font-light text-white hover:text-[#ff6d6d] transition-colors duration-300"}
                    `}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {/* Admin Login Button in Mobile Menu */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, delay: navItems.length * 0.1 }}
                className="w-full max-w-[250px] px-6"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RouterLink
                  to="/admin"
                  className="block text-center py-3.5 px-8 text-xl font-light text-gray-300 bg-gray-800/50 hover:text-white border border-gray-700/50 hover:border-[#ff6d6d] rounded-full transition-all duration-300 hover:bg-[#ff6d6d]/10 hover:shadow-lg hover:shadow-[#ff6d6d]/10 backdrop-blur-sm"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </RouterLink>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar; 