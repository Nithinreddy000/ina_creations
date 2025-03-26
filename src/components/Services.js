import React from 'react';
import { motion } from 'framer-motion';
import { FaCamera, FaVideo, FaEdit } from 'react-icons/fa';

const Services = () => {
  const services = [
    {
      icon: <FaCamera className="text-5xl text-primary-700" />,
      title: "Event Photography",
      description: "Professional photography services for corporate events, weddings, parties, and more."
    },
    {
      icon: <FaVideo className="text-5xl text-primary-700" />,
      title: "Videography",
      description: "High-quality video production to capture the essence and energy of your events."
    },
    {
      icon: <FaEdit className="text-5xl text-primary-700" />,
      title: "Professional Editing",
      description: "Expert post-production editing to deliver polished and engaging content."
    }
  ];

  return (
    <div id="services" className="w-full min-h-screen pt-28 pb-20 bg-secondary-100">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-primary-900 mb-6 relative">
              <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-primary-700/5 text-7xl md:text-8xl font-bold whitespace-nowrap">
                Our Services
              </span>
              Our Services
            </h2>
            <div className="w-24 h-1 bg-primary-700 mx-auto mb-6" />
            <p className="text-primary-800 max-w-[600px] mx-auto text-lg">
              Comprehensive photography and videography solutions for all your event needs.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="bg-gradient-to-b from-secondary-200/50 to-secondary-100/50 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group border border-secondary-300/50 hover:border-primary-700/30 backdrop-blur-sm"
            >
              <motion.div 
                className="mb-6 transform group-hover:scale-110 transition-transform duration-300"
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                {service.icon}
              </motion.div>
              <h3 className="text-2xl font-bold text-primary-900 mb-4 group-hover:text-primary-700 transition-colors duration-300">
                {service.title}
              </h3>
              <p className="text-primary-800 group-hover:text-primary-700 transition-colors duration-300">
                {service.description}
              </p>
              <motion.div
                className="w-full h-[1px] bg-gradient-to-r from-transparent via-primary-700/30 to-transparent mt-6 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                initial={false}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services; 