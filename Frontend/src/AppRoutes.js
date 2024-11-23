import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './Components/HomePage/Navbar';
import Hero from './Components/HomePage/Hero';
import Services from './Components/HomePage/Services';
import FAQ from './Components/HomePage/FAQSection';
import Footer from './Components/HomePage/Footer';
import SignUpPage from './Components/SignUpPage/SignUpPage';
import LoginPage from './Components/LoginPage/LoginPage';
import Dashboard from './Components/Dashboard/Dashboard';
import FertilityCareDashboard from './Components/DashboardFertilityCare/Dashboard';
import ForgotPassword from './Components/LoginPage/ForgotPassword';
import usePageTracking from './PageTracking';

const HomePage = () => (
  <div>
    <Navbar />
    <Hero />
    <Services />
    <FAQ />
    <Footer />
  </div>
);

function AppRoutes() {
  usePageTracking();
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/fertility-care-dashboard" element={<FertilityCareDashboard />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
    </Routes>
  );
}

export default AppRoutes;
