import React, { useState, useEffect } from 'react';
import { Link } from 'react-scroll';
import { FaBars, FaTimes } from 'react-icons/fa';
import logo from '../assets/logo/logo.png';

const Navbar = () => {
  const [nav, setNav] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => setNav(!nav);

  return (
    <nav className={`fixed w-full h-[80px] flex justify-between items-center px-8 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="logo">
        <img src={logo} alt="Ina Creations Logo" className="h-16" />
      </div>

      {/* Desktop Menu */}
      <ul className="hidden md:flex gap-8">
        <li>
          <Link 
            to="home" 
            smooth={true} 
            duration={500} 
            className="text-white hover:text-blue-400 cursor-pointer transition-colors text-sm uppercase tracking-wider font-medium"
          >
            Home
          </Link>
        </li>
        <li>
          <Link 
            to="services" 
            smooth={true} 
            duration={500} 
            className="text-white hover:text-blue-400 cursor-pointer transition-colors text-sm uppercase tracking-wider font-medium"
          >
            Services
          </Link>
        </li>
        <li>
          <Link 
            to="portfolio" 
            smooth={true} 
            duration={500} 
            className="text-white hover:text-blue-400 cursor-pointer transition-colors text-sm uppercase tracking-wider font-medium"
          >
            Portfolio
          </Link>
        </li>
        <li>
          <Link 
            to="about" 
            smooth={true} 
            duration={500} 
            className="text-white hover:text-blue-400 cursor-pointer transition-colors text-sm uppercase tracking-wider font-medium"
          >
            About
          </Link>
        </li>
        <li>
          <Link 
            to="contact" 
            smooth={true} 
            duration={500} 
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all hover:scale-105 text-sm uppercase tracking-wider font-medium"
          >
            Contact
          </Link>
        </li>
      </ul>

      {/* Hamburger */}
      <div onClick={handleClick} className="md:hidden z-50 cursor-pointer text-white fixed right-6 top-7">
        {!nav ? <FaBars size={25} /> : <FaTimes size={25} className="rotate-180 transition-transform duration-300" />}
      </div>

      {/* Mobile Menu */}
      <div className={`${nav ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} fixed top-0 right-0 w-full h-screen bg-black/30 backdrop-blur-lg transition-all duration-500 ease-in-out md:hidden`}>
        <div className="flex flex-col h-full justify-center items-center relative">
          {/* Logo in mobile menu */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
            <img src={logo} alt="Ina Creations Logo" className="h-16 animate-fade-in" />
          </div>
          
          <ul className="flex flex-col items-center gap-10">
            <li className="w-full text-center">
              <Link 
                onClick={handleClick} 
                to="home" 
                smooth={true} 
                duration={500}
                className="relative text-3xl font-extralight text-white hover:text-blue-400 cursor-pointer transition-all duration-300 hover:scale-110 group"
              >
                <span className="absolute -left-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">•</span>
                Home
                <span className="absolute -right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">•</span>
              </Link>
            </li>
            <li className="w-full text-center">
              <Link 
                onClick={handleClick} 
                to="services" 
                smooth={true} 
                duration={500}
                className="relative text-3xl font-extralight text-white hover:text-blue-400 cursor-pointer transition-all duration-300 hover:scale-110 group"
              >
                <span className="absolute -left-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">•</span>
                Services
                <span className="absolute -right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">•</span>
              </Link>
            </li>
            <li className="w-full text-center">
              <Link 
                onClick={handleClick} 
                to="portfolio" 
                smooth={true} 
                duration={500}
                className="relative text-3xl font-extralight text-white hover:text-blue-400 cursor-pointer transition-all duration-300 hover:scale-110 group"
              >
                <span className="absolute -left-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">•</span>
                Portfolio
                <span className="absolute -right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">•</span>
              </Link>
            </li>
            <li className="w-full text-center">
              <Link 
                onClick={handleClick} 
                to="about" 
                smooth={true} 
                duration={500}
                className="relative text-3xl font-extralight text-white hover:text-blue-400 cursor-pointer transition-all duration-300 hover:scale-110 group"
              >
                <span className="absolute -left-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">•</span>
                About
                <span className="absolute -right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">•</span>
              </Link>
            </li>
            <li className="w-full text-center">
              <Link 
                onClick={handleClick} 
                to="contact" 
                smooth={true} 
                duration={500}
                className="relative text-3xl font-extralight text-white hover:text-blue-400 cursor-pointer transition-all duration-300 hover:scale-110 group"
              >
                <span className="absolute -left-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">•</span>
                Contact
                <span className="absolute -right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">•</span>
              </Link>
            </li>
          </ul>
          
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-gradient-radial from-blue-500/10 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/50 to-transparent"></div>
          
          {/* Animated circles */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 