import React from 'react';
import { motion } from 'framer-motion';
import work1Video from '../assets/works/work1.mp4';

const Portfolio = () => {
  const portfolioItems = [
    {
      category: 'Corporate',
      title: 'Bhasha Bandhu Hackathon',
      description: 'Held by HDAC in collaboration with Microsoft and Bhashini Complete coverage of the tech Hackathon held at Microsoft.',
      video: work1Video,
    },
  ];

  return (
    <div id="portfolio" className="w-full py-20 bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Featured Projects</h2>
            <p className="text-gray-600 max-w-[600px] mx-auto text-lg">
              Browse through our collection of memorable events we've had the pleasure of capturing.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {portfolioItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-lg shadow-lg"
            >
              <video
                className="w-full h-[300px] object-cover"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src={item.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-blue-400 text-sm font-semibold mb-2">{item.category}</p>
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