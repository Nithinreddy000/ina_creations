import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div id="about" className="w-full min-h-screen pt-28 pb-20 bg-secondary-100">
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
                Our Story
              </span>
              Our Story
            </h2>
            <div className="w-24 h-1 bg-primary-700 mx-auto mb-6" />
            <p className="text-primary-800 mt-6 max-w-[800px] mx-auto text-lg">
              A dynamic startup revolutionizing event photography and videography with innovative approaches 
              and cutting-edge technology.
            </p>
          </motion.div>
        </div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
          className="bg-gradient-to-b from-secondary-200/50 to-secondary-200/30 p-8 rounded-xl border border-secondary-300/50 backdrop-blur-sm"
        >
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-primary-900 mb-4">Our Mission</h3>
              <p className="text-primary-800 mb-6">
                Transforming moments into timeless memories through innovative storytelling 
                and state-of-the-art technology.
              </p>
              <ul className="space-y-4">
                {[
                  "Professional team",
                  "Latest equipment",
                  "Quick delivery",
                  "Custom packages"
                ].map((item, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center group"
                  >
                    <motion.span 
                      className="w-2 h-2 bg-primary-700 rounded-full mr-3 group-hover:scale-150"
                      whileHover={{ scale: 1.5 }}
                      transition={{ duration: 0.2 }}
                    />
                    <span className="text-primary-800 group-hover:text-primary-900 transition-colors duration-300">
                      {item}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary-900 mb-4">Our Values</h3>
              <div className="space-y-6">
                {[
                  {
                    title: "Innovation",
                    description: "Exploring new technologies for unique perspectives."
                  },
                  {
                    title: "Client Focus",
                    description: "Your vision is our priority."
                  },
                  {
                    title: "Quality",
                    description: "Excellence in every shot."
                  }
                ].map((value, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="p-4 rounded-lg bg-secondary-200/30 border border-secondary-300/30 hover:border-primary-700/30 transition-all duration-300 group"
                  >
                    <h4 className="text-lg font-semibold text-primary-900 mb-2 group-hover:text-primary-700 transition-colors duration-300">
                      {value.title}
                    </h4>
                    <p className="text-primary-800 group-hover:text-primary-700 transition-colors duration-300">
                      {value.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About; 