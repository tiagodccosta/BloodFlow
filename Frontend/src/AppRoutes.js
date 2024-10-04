import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './Components/HomePage/Navbar';
import Hero from './Components/HomePage/Hero';
import Services from './Components/HomePage/Services';
import Newsletter from './Components/HomePage/Newsletter';
import Cards from './Components/HomePage/Cards';
import Footer from './Components/HomePage/Footer';
import SignUpPage from './Components/SignUpPage/SignUpPage';
import LoginPage from './Components/LoginPage/LoginPage';
import Dashboard from './Components/Dashboard/Dashboard';
import ForgotPassword from './Components/LoginPage/ForgotPassword';
import usePageTracking from './PageTracking';

const HomePage = () => (
  <div>
    <Navbar />
    <Hero />
    <Services />
    <Newsletter />
    <Cards />
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
      <Route path="/forgotpassword" element={<ForgotPassword />} />
    </Routes>
  );
}

export default AppRoutes;
