import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const firebaseConfig = {
  apiKey: "AIzaSyCESj7lM5z3JZqRAlOq84ob1Otm8XhKd0k",
  authDomain: "inacreations-6ada9.firebaseapp.com",
  projectId: "inacreations-6ada9",
  storageBucket: "inacreations-6ada9.firebasestorage.app",
  messagingSenderId: "692311035508",
  appId: "1:692311035508:web:ebc12e16c15094c1fe8b21",
  measurementId: "G-G9XH30KPDC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Successfully logged in
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Invalid email address format');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('Invalid email or password');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later');
          break;
        default:
          setError('An error occurred. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4 relative">
      {/* Back Button */}
      <motion.div 
        className="absolute top-8 left-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <RouterLink
          to="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 group"
        >
          <motion.div
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gray-800/50 p-3 rounded-full border border-gray-700/50 hover:border-[#ff6d6d] hover:bg-[#ff6d6d]/10 backdrop-blur-sm transition-all duration-300"
          >
            <FaArrowLeft className="text-xl" />
          </motion.div>
          <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Back to Home
          </span>
        </RouterLink>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700/50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-white mb-2">Admin Login</h2>
            <div className="w-16 h-1 bg-[#ff6d6d] mx-auto" />
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="email">
                Email Address
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff6d6d] focus:border-transparent transition-all"
                placeholder="admin@example.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="password">
                Password
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff6d6d] focus:border-transparent transition-all"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm text-center bg-red-500/10 py-2 px-4 rounded-lg border border-red-500/20"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium text-white transition-all ${
                loading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-[#ff6d6d] hover:bg-[#ff5555] hover:shadow-lg hover:shadow-[#ff6d6d]/20'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center"
          >
            <p className="text-gray-400 text-sm">
              This is a protected area. Only authorized personnel can access.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin; 