import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInstagram, FaLinkedin } from 'react-icons/fa';

const Team = () => {
  const [activeMember, setActiveMember] = useState(null);
  const [hoveredMember, setHoveredMember] = useState(null);

  const handleMemberClick = (name) => {
    setActiveMember(activeMember === name ? null : name);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const memberVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const teamMembers = [
    {
      name: "Nagendra Hemanth",
      title: "Founder",
      description: "Visionary leader driving innovation in event photography , videography and Editing.",
      image: require('../assets/our_team/Hemanth.png'),
      instagram: "https://www.instagram.com/nagendra_hemanth?igsh=bGg3N2o3NTQ3cWw2",
      linkedin: "https://www.linkedin.com/in/nagendra-hemanth-71b5b3348"
    },
    {
      name: "G Yashasri",
      title: "Co-Founder",
      description: "Strategic leader shaping the creative direction of INA Creations.",
      image: require('../assets/our_team/Yashasri.png'),
      instagram: "https://www.instagram.com/yashasri_g?igsh=a3owZnUxNzZ0cTRx",
      linkedin: "https://www.linkedin.com/in/gyashasri341"
    },
    {
      name: "Chandhan Varma",
      title: "Cinematography Lead",
      description: "Expert cinematographer crafting compelling visual narratives.",
      image: require('../assets/our_team/Chandhan.png'),
      instagram: "https://www.instagram.com/chandanvarma247?igsh=Y3djZWY0c3IxN2kx",
      linkedin: "https://www.linkedin.com/in/chiranjeevi-chandan-varma-928175346"
    },
    {
      name: "Thanuja",
      title: "Photography & Videography",
      description: "Skilled visual artist capturing moments with unique perspective.",
      image: require('../assets/our_team/Thanuja.png'),
      instagram: "https://www.instagram.com/__tanu__7572?igsh=bDJ3NHAxdGducTl5",
      linkedin: "https://www.linkedin.com/in/thanuja-chintham-0951b929a"
    },
    {
      name: "Bhuvana",
      title: "Photography & Videography",
      description: "Creative professional specializing in visual storytelling.",
      image: require('../assets/our_team/Bhuvana.png'),
      instagram: "https://www.instagram.com/_.thehoneybadger?igsh=aXVtbTA4b2xpeWRm",
      linkedin: null
    },
    {
      name: "Manish",
      title: "Treasurer",
      description: "Strategic financial planning and management specialist.",
      image: require('../assets/our_team/Manish.png'),
      instagram: "https://www.instagram.com/yama__0512?igsh=NmNiaTIxeHhvdHEx",
    },
    {
      name: "Nithin Reddy",
      title: "Technical Lead",
      description: "Technical expert ensuring cutting-edge solutions and innovation.",
      image: require('../assets/our_team/Nithin.png'),
      instagram: "https://www.instagram.com/nithin____reddy___?igsh=Z2V4eXoycGpmcXQ4",
      linkedin: "https://www.linkedin.com/in/nithin-reddy1/"
    }
  ];

  return (
    <div id="team" className="w-full py-32 bg-secondary-100 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-700/5 via-transparent to-transparent opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,_var(--tw-gradient-stops))] from-secondary-200/10 via-transparent to-secondary-200/10" />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 relative">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-primary-900 mb-6 relative">
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-primary-700/5 text-7xl md:text-8xl font-bold whitespace-nowrap">
                Meet Our Team
              </span>
              Meet Our Team
            </h2>
            <div className="w-24 h-1 bg-primary-700 mx-auto mb-6" />
            <p className="text-xl text-primary-800 max-w-[600px] mx-auto">
              The talented individuals behind INA Creations
            </p>
          </motion.div>
        </div>

        <motion.div 
          className="grid md:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              variants={memberVariants}
              className="group relative"
              onClick={() => handleMemberClick(member.name)}
              onHoverStart={() => setHoveredMember(member.name)}
              onHoverEnd={() => setHoveredMember(null)}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative overflow-hidden rounded-xl shadow-lg bg-secondary-200/50 backdrop-blur-sm border border-secondary-300/50 cursor-pointer md:cursor-default group-hover:border-primary-700/30 transition-all duration-500">
                {/* Image Container */}
                <div className="h-[300px] overflow-hidden">
                  <motion.img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary-100/90 via-secondary-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Content Overlay */}
                <AnimatePresence>
                  {(hoveredMember === member.name || activeMember === member.name) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-secondary-100/95 via-secondary-100/70 to-transparent"
                    >
                      <motion.h3 
                        className="text-xl font-bold text-primary-900 mb-2"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        {member.name}
                      </motion.h3>
                      <motion.p 
                        className="text-primary-700 font-medium mb-3"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {member.title}
                      </motion.p>
                      <motion.p 
                        className="text-primary-800 mb-4 text-sm"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {member.description}
                      </motion.p>
                      
                      {/* Social Links */}
                      <motion.div 
                        className="flex space-x-4"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        {member.instagram && (
                          <motion.a 
                            href={member.instagram} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-800 hover:text-primary-700 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            whileHover={{ scale: 1.2, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FaInstagram size={20} />
                          </motion.a>
                        )}
                        {member.linkedin && (
                          <motion.a 
                            href={member.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-800 hover:text-primary-700 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            whileHover={{ scale: 1.2, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FaLinkedin size={20} />
                          </motion.a>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quick Info (Visible by default) */}
                <AnimatePresence>
                  {hoveredMember !== member.name && activeMember !== member.name && (
                    <motion.div
                      initial={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute bottom-0 left-0 right-0 p-4 bg-secondary-200/90 backdrop-blur-sm border-t border-secondary-300/50"
                    >
                      <h3 className="text-lg font-bold text-primary-900">{member.name}</h3>
                      <p className="text-primary-700 text-sm">{member.title}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Team; 