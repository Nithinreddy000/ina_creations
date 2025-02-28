import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { uploadVideoToCloudinary, uploadThumbnailToCloudinary } from '../utils/cloudinary';
import { addPortfolioItem, getPortfolioItems, deletePortfolioItem } from '../utils/firebase';
import { FaTrash, FaPlay, FaImage, FaHome, FaVideo, FaSignOutAlt, FaUpload, FaSpinner, FaBars } from 'react-icons/fa';
import { BiError } from 'react-icons/bi';

const AdminDashboard = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [thumbnailProgress, setThumbnailProgress] = useState(0);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [previewThumbnail, setPreviewThumbnail] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    video: null,
    thumbnail: null
  });

  // Stats
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalViews: 0,
    recentUploads: 0
  });

  // Load portfolio items and calculate stats
  const loadPortfolioItems = async () => {
    try {
      const items = await getPortfolioItems();
      const sortedItems = items.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
      setPortfolioItems(sortedItems);
      
      // Calculate stats
      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      setStats({
        totalVideos: items.length,
        totalViews: items.reduce((acc, item) => acc + (item.views || 0), 0),
        recentUploads: items.filter(item => item.createdAt.toDate() > lastWeek).length
      });
    } catch (error) {
      console.error('Error loading portfolio items:', error);
      setError('Failed to load portfolio items');
    } finally {
      setLoading(false);
    }
  };

  // Load portfolio items
  useEffect(() => {
    loadPortfolioItems();
  }, []);

  // Check authentication
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/admin');
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/admin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    
    if (file) {
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      if (name === 'video') {
        setPreviewVideo(previewUrl);
      } else if (name === 'thumbnail') {
        setPreviewThumbnail(previewUrl);
      }

      return () => URL.revokeObjectURL(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.video) {
      setError('Please select a video file');
      return;
    }

    setIsUploading(true);
    setLoading(true);
    setError('');
    setUploadProgress(0);
    setThumbnailProgress(0);

    try {
      // Upload video to Cloudinary
      const uploadResult = await uploadVideoToCloudinary(formData.video, (progress) => {
        setUploadProgress(progress);
      });

      let thumbnailUrl = uploadResult.thumbnail;
      let thumbnailPublicId = null;

      // If custom thumbnail is provided, upload it
      if (formData.thumbnail) {
        try {
          const thumbnailResult = await uploadThumbnailToCloudinary(formData.thumbnail, (progress) => {
            setThumbnailProgress(progress);
          });
          thumbnailUrl = thumbnailResult.url;
          thumbnailPublicId = thumbnailResult.publicId;
        } catch (thumbnailError) {
          console.error('Error uploading thumbnail:', thumbnailError);
          // Continue with auto-generated thumbnail if custom thumbnail upload fails
        }
      }

      // Create portfolio item
      const portfolioItem = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        videoUrl: uploadResult.url,
        thumbnail: thumbnailUrl,
        videoPublicId: uploadResult.publicId,
        thumbnailPublicId,
        duration: uploadResult.duration,
        createdAt: new Date()
      };

      // Add to Firebase
      await addPortfolioItem(portfolioItem);

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        video: null,
        thumbnail: null
      });
      setPreviewVideo(null);
      setPreviewThumbnail(null);
      setUploadProgress(0);
      setThumbnailProgress(0);
      setError(null);
      
      // Refresh portfolio items
      await loadPortfolioItems();
    } catch (error) {
      console.error('Error uploading:', error);
      setError(error.message || 'Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deletePortfolioItem(itemId);
        setPortfolioItems(prev => prev.filter(item => item.id !== itemId));
      } catch (error) {
        console.error('Error deleting item:', error);
        setError('Failed to delete item');
      }
    }
  };

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-6 rounded-2xl border border-purple-500/20 backdrop-blur-xl"
      >
        <h3 className="text-purple-400 text-sm font-medium">Total Videos</h3>
        <p className="text-3xl font-bold text-white mt-2">{stats.totalVideos}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-6 rounded-2xl border border-blue-500/20 backdrop-blur-xl"
      >
        <h3 className="text-blue-400 text-sm font-medium">Total Views</h3>
        <p className="text-3xl font-bold text-white mt-2">{stats.totalViews}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-[#ff6d6d]/20 to-red-600/20 p-6 rounded-2xl border border-[#ff6d6d]/20 backdrop-blur-xl"
      >
        <h3 className="text-[#ff6d6d] text-sm font-medium">Recent Uploads</h3>
        <p className="text-3xl font-bold text-white mt-2">{stats.recentUploads}</p>
      </motion.div>
    </div>
  );

  const renderPortfolioItems = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 portfolio-grid">
      {portfolioItems.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50 backdrop-blur-xl group"
        >
          <div className="relative aspect-video">
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-full bg-[#ff6d6d]/80 text-white hover:bg-[#ff6d6d]"
                onClick={() => window.open(item.videoUrl, '_blank')}
              >
                <FaPlay />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-full bg-red-500/80 text-white hover:bg-red-500"
                onClick={() => handleDelete(item.id)}
              >
                <FaTrash />
              </motion.button>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
            <p className="text-gray-400 text-sm mb-2">{item.description}</p>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
              {item.category}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Overlay for mobile - only shows when sidebar is open on mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: isSidebarOpen ? 0 : -280 }}
        className="fixed left-0 top-0 h-full w-[280px] bg-gray-800/50 backdrop-blur-xl border-r border-gray-700/50 z-50"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:flex hidden p-2 rounded-lg text-gray-400 hover:bg-gray-700/50"
            >
              <FaBars />
            </button>
          </div>
          <nav className="space-y-2">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                if (window.innerWidth < 768) {
                  setIsSidebarOpen(false);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#ff6d6d] text-white'
                  : 'text-gray-400 hover:bg-gray-700/50'
              }`}
            >
              <FaHome /> Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab('portfolio');
                if (window.innerWidth < 768) {
                  setIsSidebarOpen(false);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'portfolio'
                  ? 'bg-[#ff6d6d] text-white'
                  : 'text-gray-400 hover:bg-gray-700/50'
              }`}
            >
              <FaVideo /> Portfolio
            </button>
            <button
              onClick={() => {
                setActiveTab('upload');
                if (window.innerWidth < 768) {
                  setIsSidebarOpen(false);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'upload'
                  ? 'bg-[#ff6d6d] text-white'
                  : 'text-gray-400 hover:bg-gray-700/50'
              }`}
            >
              <FaUpload /> Upload
            </button>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="absolute bottom-8 left-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/20 transition-all"
        >
          <FaSignOutAlt /> Sign Out
        </button>
      </motion.div>

      {/* Main Content */}
      <div 
        className={`transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-[280px] ml-0' : 'ml-0'
        }`}
      >
        <main className="p-4 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
              >
                <FaBars />
              </button>
              <h2 className="text-2xl lg:text-3xl font-bold text-white">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 flex items-center gap-3"
              >
                <BiError size={20} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dashboard Grid */}
          <div className="max-w-[1600px] mx-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <FaSpinner className="animate-spin text-4xl text-[#ff6d6d]" />
              </div>
            ) : (
              <>
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'portfolio' && renderPortfolioItems()}
                {activeTab === 'upload' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto"
                  >
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-4">
                        <label className="block">
                          <span className="text-gray-300 text-sm font-medium">Title</span>
                          <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff6d6d] focus:border-transparent transition-all"
                            placeholder="Enter video title"
                            required
                          />
                        </label>

                        <label className="block">
                          <span className="text-gray-300 text-sm font-medium">Category</span>
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff6d6d] focus:border-transparent transition-all"
                            required
                          >
                            <option value="">Select Category</option>
                            <option value="Corporate">Corporate</option>
                            <option value="Wedding">Wedding</option>
                            <option value="Event">Event</option>
                            <option value="Other">Other</option>
                          </select>
                        </label>

                        <label className="block">
                          <span className="text-gray-300 text-sm font-medium">Description</span>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff6d6d] focus:border-transparent transition-all"
                            rows="4"
                            placeholder="Enter video description"
                            required
                          />
                        </label>

                        {/* File Upload Section */}
                        <div className="space-y-4">
                          <div className="relative">
                            <input
                              type="file"
                              name="video"
                              onChange={handleFileChange}
                              accept="video/*"
                              className="hidden"
                              id="video-upload"
                              required
                            />
                            <label
                              htmlFor="video-upload"
                              className="block w-full p-4 rounded-xl border-2 border-dashed border-gray-700 hover:border-[#ff6d6d] transition-all cursor-pointer"
                            >
                              <div className="flex flex-col items-center justify-center">
                                <FaVideo className="text-3xl text-gray-500 mb-2" />
                                <span className="text-gray-400">
                                  {formData.video ? formData.video.name : 'Click to upload video'}
                                </span>
                              </div>
                            </label>
                            {previewVideo && (
                              <video
                                src={previewVideo}
                                className="mt-2 w-full rounded-xl"
                                controls
                              />
                            )}
                          </div>

                          <div className="relative">
                            <input
                              type="file"
                              name="thumbnail"
                              onChange={handleFileChange}
                              accept="image/*"
                              className="hidden"
                              id="thumbnail-upload"
                            />
                            <label
                              htmlFor="thumbnail-upload"
                              className="block w-full p-4 rounded-xl border-2 border-dashed border-gray-700 hover:border-[#ff6d6d] transition-all cursor-pointer"
                            >
                              <div className="flex flex-col items-center justify-center">
                                <FaImage className="text-3xl text-gray-500 mb-2" />
                                <span className="text-gray-400">
                                  {formData.thumbnail ? formData.thumbnail.name : 'Click to upload thumbnail (optional)'}
                                </span>
                              </div>
                            </label>
                            {previewThumbnail && (
                              <img
                                src={previewThumbnail}
                                alt="Thumbnail preview"
                                className="mt-2 w-full rounded-xl"
                              />
                            )}
                          </div>
                        </div>

                        {/* Upload Progress */}
                        {isUploading && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-400">
                              <span>Uploading video...</span>
                              <span>{Math.round(uploadProgress)}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#ff6d6d] transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                            {formData.thumbnail && (
                              <>
                                <div className="flex justify-between text-sm text-gray-400">
                                  <span>Uploading thumbnail...</span>
                                  <span>{Math.round(thumbnailProgress)}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#ff6d6d] transition-all duration-300"
                                    style={{ width: `${thumbnailProgress}%` }}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        <motion.button
                          type="submit"
                          disabled={isUploading}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full py-4 rounded-xl text-white font-medium transition-all ${
                            isUploading
                              ? 'bg-gray-700 cursor-not-allowed'
                              : 'bg-[#ff6d6d] hover:bg-[#ff5555]'
                          }`}
                        >
                          {isUploading ? (
                            <span className="flex items-center justify-center gap-2">
                              <FaSpinner className="animate-spin" />
                              Uploading...
                            </span>
                          ) : (
                            'Upload Video'
                          )}
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Responsive styles for portfolio grid */}
      <style jsx>{`
        @media (min-width: 1024px) {
          .portfolio-grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard; 