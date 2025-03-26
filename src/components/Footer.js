import React, { useRef } from 'react';
import { FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Link } from 'react-scroll';
import logo from '../assets/logo/logo.png';

const Footer = () => {
  const timerRef = useRef(null);

  // Use consistent scrolling approach throughout the app
  const handleSmoothScroll = (sectionId, e) => {
    if (e) e.preventDefault();
    
    const section = document.getElementById(sectionId);
    if (section) {
      // Use react-scroll's smooth scrolling logic for consistency
      // This will use the same animation as our navbar components
      window.scrollTo({
        top: section.offsetTop - 100, // Account for header/padding
        behavior: 'smooth'
      });
    }
  };

  return (
    <footer className="bg-secondary-100 text-primary-900 w-full max-w-[100vw] overflow-hidden">
      <div className="max-w-[1200px] mx-auto py-12 px-4 md:pb-12 pb-28">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="col-span-1">
            <img src={logo} alt="Ina Creations Logo" className="h-24 mb-6" />
            <p className="text-primary-800 text-sm">
              Capturing moments, creating memories, and telling stories through professional event photography and videography.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary-700">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="home"
                  spy={false}
                  smooth={true}
                  duration={1500} 
                  className="text-primary-800 hover:text-primary-700 transition-colors cursor-pointer"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="services"
                  spy={false}
                  smooth={true}
                  duration={1500}
                  offset={-100}
                  className="text-primary-800 hover:text-primary-700 transition-colors cursor-pointer"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link 
                  to="portfolio"
                  spy={false}
                  smooth={true}
                  duration={1500}
                  offset={-100}
                  className="text-primary-800 hover:text-primary-700 transition-colors cursor-pointer"
                >
                  Portfolio
                </Link>
              </li>
              <li>
                <Link 
                  to="contact"
                  spy={false}
                  smooth={true}
                  duration={1500}
                  offset={-100}
                  className="text-primary-800 hover:text-primary-700 transition-colors cursor-pointer"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary-700">Services</h3>
            <ul className="space-y-2">
              <li className="text-primary-800">Event Photography</li>
              <li className="text-primary-800">Videography</li>
              <li className="text-primary-800">Professional Editing</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary-700">Contact Info</h3>
            <ul className="space-y-2">
              <li className="text-primary-800">Hyderabad</li>
              <li className="text-primary-800">Telangana</li>
              <li className="text-primary-800">Phone: +91 7013120347</li>
              <li className="text-primary-800">Email: ina.creations1002@gmail.com</li>
            </ul>
          </div>
        </div>

        {/* Social Links and Copyright */}
        <div className="border-t border-secondary-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              <a href="https://www.instagram.com/_ina.creations_?igsh=b2hjNDkwZXVxb2ds" 
                 className="text-primary-800 hover:text-primary-700 transition-colors">
                <FaInstagram size={24} />
              </a>
              <a href="#" className="text-primary-800 hover:text-primary-700 transition-colors">
                <FaLinkedin size={24} />
              </a>
            </div>
            <p className="text-primary-800 text-sm">
              © {new Date().getFullYear()} Ina Creations. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 