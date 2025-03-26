import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import Navbar from './components/Navbar';
import MobileNavbar from './components/MobileNavbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import Team from './components/Team';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { PerformanceProvider } from './components/PerformanceProvider';
import { LoadingProvider, useLoading } from './utils/loadingManager';
import LoadingScreen from './components/LoadingScreen';
import { initializeAssetLoading } from './utils/assetRegistry';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// AppContent component with loading initialization
const AppContent = () => {
  const loadingManager = useLoading();

  // Initialize asset loading on mount
  useEffect(() => {
    // Start the global loading process
    initializeAssetLoading(loadingManager).then(() => {
      console.log('Critical assets loaded');
    });
    
    // Add a timing failsafe in case something gets stuck
    const forceCompleteTimeout = setTimeout(() => {
      console.log('Loading timeout reached - forcing complete');
    }, 20000); // 20 second max loading time
    
    return () => {
      clearTimeout(forceCompleteTimeout);
    };
  }, [loadingManager]);

  return (
    <Router>
      <div className="w-full max-w-[100vw] overflow-hidden">
        {/* Loading Screen - shows until all assets are loaded */}
        <LoadingScreen />
        
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Main Website Route */}
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <Hero />
                <Services />
                <Portfolio />
                <Team />
                <About />
                <Contact />
                <Footer />
                <MobileNavbar />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <PerformanceProvider>
      <LoadingProvider>
        <AppContent />
      </LoadingProvider>
    </PerformanceProvider>
  );
};

export default App;
