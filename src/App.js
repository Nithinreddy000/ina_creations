import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import Team from './components/Team';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
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
            </>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
