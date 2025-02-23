import React from 'react';
import { motion } from 'framer-motion';
import { FaCamera, FaVideo, FaEdit } from 'react-icons/fa';

const Services = () => {
  const services = [
    {
      icon: <FaCamera className="text-5xl text-[#ff6d6d]" />,
      title: "Event Photography",
      description: "Professional photography services for corporate events, weddings, parties, and more."
    },
    {
      icon: <FaVideo className="text-5xl text-[#ff6d6d]" />,
      title: "Videography",
      description: "High-quality video production to capture the essence and energy of your events."
    },
    {
      icon: <FaEdit className="text-5xl text-[#ff6d6d]" />,
      title: "Professional Editing",
      description: "Expert post-production editing to deliver polished and engaging content."
    }
  ];

  return (
    <div id="services" className="w-full py-20 bg-gray-900">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">Our Services</h2>
            <p className="text-gray-400 max-w-[600px] mx-auto text-lg">
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
              viewport={{ once: true }}
              className="bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group border border-gray-700 hover:border-[#ff6d6d]/30"
            >
              <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
              <p className="text-gray-400">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services; 