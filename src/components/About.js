import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div id="about" className="w-full py-20 bg-gray-900">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mt-2">Our Story</h2>
            <p className="text-gray-400 mt-6 max-w-[800px] mx-auto text-lg">
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
          viewport={{ once: true }}
          className="bg-gray-800 p-8 rounded-lg border border-gray-700"
        >
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
              <p className="text-gray-400 mb-6">
                Transforming moments into timeless memories through innovative storytelling 
                and state-of-the-art technology.
              </p>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#ff6d6d] rounded-full mr-3"></span>
                  Professional team
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#ff6d6d] rounded-full mr-3"></span>
                  Latest equipment
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#ff6d6d] rounded-full mr-3"></span>
                  Quick delivery
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#ff6d6d] rounded-full mr-3"></span>
                  Custom packages
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Values</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Innovation</h4>
                  <p className="text-gray-400">
                    Exploring new technologies for unique perspectives.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Client Focus</h4>
                  <p className="text-gray-400">
                    Your vision is our priority.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Quality</h4>
                  <p className="text-gray-400">
                    Excellence in every shot.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About; 