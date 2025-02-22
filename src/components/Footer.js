import React from 'react';
import { FaInstagram, FaLinkedin } from 'react-icons/fa';
import logo from '../assets/logo/logo.png';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-[1200px] mx-auto py-12 px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="col-span-1">
            <img src={logo} alt="Ina Creations Logo" className="h-12 mb-4" />
            <p className="text-gray-400 text-sm">
              Capturing moments, creating memories, and telling stories through professional event photography and videography.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#home" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
              <li><a href="#services" className="text-gray-400 hover:text-white transition-colors">Services</a></li>
              <li><a href="#portfolio" className="text-gray-400 hover:text-white transition-colors">Portfolio</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-4">Services</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Event Photography</li>
              <li className="text-gray-400">Videography</li>
              <li className="text-gray-400">Professional Editing</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Info</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Hyderabad</li>
              <li className="text-gray-400">Telangana</li>
              <li className="text-gray-400">Phone: +91 7013120347</li>
              <li className="text-gray-400">Email: ina.creations1002@gmail.com</li>
            </ul>
          </div>
        </div>

        {/* Social Links and Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              <a href="https://www.instagram.com/_ina.creations_?igsh=b2hjNDkwZXVxb2ds" className="text-gray-400 hover:text-white transition-colors">
                <FaInstagram size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaLinkedin size={24} />
              </a>
            </div>
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Ina Creations. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 