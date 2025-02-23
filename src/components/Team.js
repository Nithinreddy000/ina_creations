import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaInstagram, FaLinkedin } from 'react-icons/fa';

const Team = () => {
  const [activeMember, setActiveMember] = useState(null);

  const handleMemberClick = (name) => {
    setActiveMember(activeMember === name ? null : name);
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
      name: "Sahasra",
      title: "Treasurer",
      description: "Financial management expert ensuring operational excellence.",
      image: require('../assets/our_team/Sahasra.png'),
      instagram: "https://www.instagram.com/sahasra_reddyy_03?igsh=MTY0eXpwMTN5M281MQ==",
      linkedin: "https://www.linkedin.com/in/sahasra-reddy-86705a348"
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
    <div id="team" className="w-full py-20 bg-gray-900">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">Meet Our Team</h2>
            <p className="text-gray-400 max-w-[600px] mx-auto text-lg">
              The talented individuals behind INA Creations, dedicated to excellence.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
              onClick={() => handleMemberClick(member.name)}
            >
              <div className="relative overflow-hidden rounded-xl shadow-lg bg-gray-800 border border-gray-700 cursor-pointer md:cursor-default">
                {/* Image Container */}
                <div className="h-[300px] overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Content Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-all duration-500
                  md:opacity-0 md:group-hover:opacity-100
                  ${activeMember === member.name ? 'opacity-100' : 'opacity-0'}`}
                >
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                    <p className="text-[#ff6d6d] font-medium mb-3">{member.title}</p>
                    <p className="text-gray-300 mb-4 text-sm">{member.description}</p>
                    
                    {/* Social Links */}
                    <div className="flex space-x-4">
                      {member.instagram && (
                        <a 
                          href={member.instagram} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-300 hover:text-[#ff6d6d] transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FaInstagram size={20} />
                        </a>
                      )}
                      {member.linkedin && (
                        <a 
                          href={member.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-300 hover:text-[#ff6d6d] transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FaLinkedin size={20} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Info (Visible by default) */}
                <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gray-800/90 backdrop-blur-sm transition-transform duration-500 border-t border-gray-700
                  md:transform md:translate-y-0 md:group-hover:translate-y-full
                  ${activeMember === member.name ? 'transform translate-y-full' : 'transform translate-y-0'}`}
                >
                  <h3 className="text-lg font-bold text-white">{member.name}</h3>
                  <p className="text-[#ff6d6d] text-sm">{member.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Team; 