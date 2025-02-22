import React from 'react';
import { FaCamera, FaVideo, FaEdit } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Services = () => {
  const services = [
    {
      icon: <FaCamera size={40} />,
      title: 'Event Photography',
      description: 'Professional photography services for corporate events, weddings, parties, and more.',
    },
    {
      icon: <FaVideo size={40} />,
      title: 'Videography',
      description: 'High-quality video production to capture the essence and energy of your events.',
    },
    {
      icon: <FaEdit size={40} />,
      title: 'Professional Editing',
      description: 'Expert post-production editing to deliver polished and engaging content.',
    },
  ];

  return (
    <div id="services" className="w-full py-20 bg-white">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">What We Offer</h2>
            <p className="text-gray-600 max-w-[600px] mx-auto text-lg">
              We provide comprehensive event coverage solutions tailored to your needs.
              Our team of professionals ensures every moment is captured perfectly.
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
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-blue-600 mb-4">
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">{service.title}</h3>
              <p className="text-gray-600">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services; 