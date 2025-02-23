import React, { useState } from 'react';
import { motion } from 'framer-motion';
import work1Video from '../assets/works/work1.mp4';

const Portfolio = () => {
  const [activeItem, setActiveItem] = useState(null);

  const portfolioItems = [
    {
      id: 1,
      category: 'Corporate',
      title: 'Bhasha Bandhu Hackathon',
      description: 'Tech Hackathon coverage at Microsoft - HDAC & Bhashini collaboration.',
      video: work1Video,
    },
  ];

  const handleItemClick = (id) => {
    setActiveItem(activeItem === id ? null : id);
  };

  return (
    <div id="portfolio" className="w-full py-20 bg-gray-900">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">Our Work</h2>
            <p className="text-gray-400 max-w-[600px] mx-auto text-lg">
              Featured events we've captured.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {portfolioItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className={`group relative overflow-hidden rounded-lg shadow-lg border border-gray-700 bg-gray-800 cursor-pointer md:cursor-default ${
                activeItem === item.id ? 'touch-active' : ''
              }`}
              onClick={() => handleItemClick(item.id)}
            >
              <video
                className="w-full h-[300px] object-cover opacity-90"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src={item.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-all duration-300 
                md:opacity-0 md:group-hover:opacity-100
                ${activeItem === item.id ? 'opacity-100' : 'opacity-0'}`}
              >
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-[#ff6d6d] text-sm font-semibold mb-2">{item.category}</p>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-300">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Portfolio; 