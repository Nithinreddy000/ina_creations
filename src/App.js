import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Team from './components/Team';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Hero />
        <Services />
        <Portfolio />
        <Team />
        <About />
        <Contact />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
