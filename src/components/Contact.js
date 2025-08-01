import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import emailjs from '@emailjs/browser';

const Contact = () => {
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(false);

    // Prepare template parameters
    const templateParams = {
      from_name: formRef.current.user_name.value,
      to_name: 'Ina Creations',
      from_email: formRef.current.user_email.value,
      to_email: 'ina.creations1002@gmail.com',
      message: formRef.current.message.value,
      phone: formRef.current.user_phone.value,
      event_type: formRef.current.event_type.value,
      reply_to: formRef.current.user_email.value
    };

    try {
      await emailjs.send(
        'service_v5qr1ji', // Your service ID
        'template_11j4l6p', // Your template ID
        templateParams,
        'rfU8TlQrTcG7zLbGk' // Your public key
      );
      
      setSuccess(true);
      formRef.current.reset();
    } catch (error) {
      console.error('Error:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="contact" className="w-full min-h-screen bg-secondary-100 py-20">
      <div className="max-w-[1200px] mx-auto p-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-primary-900 mb-4">Get In Touch</h2>
            <p className="text-primary-800 max-w-[600px] mx-auto text-lg">
              Let's create memories together.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-secondary-200 p-8 rounded-xl shadow-lg border border-secondary-300"
          >
            <h3 className="text-2xl font-bold text-primary-900 mb-8">Contact Information</h3>
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-primary-700/10 p-3 rounded-full">
                  <FaPhone className="text-primary-700 text-xl" />
                </div>
                <div>
                  <p className="font-semibold text-primary-900">Phone</p>
                  <p className="text-primary-800">+91 7013120347</p>
                  <p className="text-sm text-primary-700 mt-1">Available Sat-Sun, 9am-6pm</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-primary-700/10 p-3 rounded-full">
                  <FaEnvelope className="text-primary-700 text-xl" />
                </div>
                <div>
                  <p className="font-semibold text-primary-900">Email</p>
                  <p className="text-primary-800">ina.creations1002@gmail.com</p>
                  <p className="text-sm text-primary-700 mt-1">We'll respond within 24 hours</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-primary-700/10 p-3 rounded-full">
                  <FaMapMarkerAlt className="text-primary-700 text-xl" />
                </div>
                <div>
                  <p className="font-semibold text-primary-900">Location</p>
                  <p className="text-primary-800">Hyderabad</p>
                  <p className="text-primary-800">Telangana</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-secondary-200 p-8 rounded-xl shadow-lg border border-secondary-300"
          >
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-primary-900 text-sm font-bold mb-2" htmlFor="name">
                  Full Name
                </label>
                <input
                  className="w-full px-4 py-3 rounded-lg bg-white border border-secondary-300 text-primary-900 placeholder-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent transition-all"
                  type="text"
                  name="user_name"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-primary-900 text-sm font-bold mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  className="w-full px-4 py-3 rounded-lg bg-white border border-secondary-300 text-primary-900 placeholder-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent transition-all"
                  type="email"
                  name="user_email"
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-primary-900 text-sm font-bold mb-2" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  className="w-full px-4 py-3 rounded-lg bg-white border border-secondary-300 text-primary-900 placeholder-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent transition-all"
                  type="tel"
                  name="user_phone"
                  placeholder="+91 1234567890"
                  required
                />
              </div>
              <div>
                <label className="block text-primary-900 text-sm font-bold mb-2" htmlFor="event_type">
                  Event Type
                </label>
                <select
                  className="w-full px-4 py-3 rounded-lg bg-white border border-secondary-300 text-primary-900 placeholder-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent transition-all"
                  name="event_type"
                  required
                >
                  <option value="">Select Event Type</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Corporate">Corporate Event</option>
                  <option value="Birthday">Birthday Party</option>
                  <option value="Concert">Concert</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-primary-900 text-sm font-bold mb-2" htmlFor="message">
                  Message
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg bg-white border border-secondary-300 text-primary-900 placeholder-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent transition-all"
                  name="message"
                  rows="4"
                  placeholder="Tell us about your event..."
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-lg font-bold text-white transition-all ${
                  loading 
                    ? 'bg-primary-400 cursor-not-allowed' 
                    : 'bg-primary-700 hover:bg-primary-800 hover:shadow-lg'
                }`}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
              
              {/* Success Message */}
              {success && (
                <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg border border-green-300">
                  Thank you! Your message has been sent successfully. We'll get back to you soon.
                </div>
              )}
              
              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-lg border border-red-300">
                  Oops! Something went wrong. Please try again later.
                </div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 