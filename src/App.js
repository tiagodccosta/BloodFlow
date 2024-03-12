import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Change this line
import Navbar from './Components/HomePage/Navbar';
import Hero from './Components/HomePage/Hero';
import Services from './Components/HomePage/Services';
import Newsletter from './Components/HomePage/Newsletter';
import Cards from './Components/HomePage/Cards';
import Footer from './Components/HomePage/Footer';
import SignUpPage from './Components/SignUpPage/SignUpPage';
import LoginPage from './Components/LoginPage/LoginPage';

const HomePage = () => (
  <div>
    <Navbar />
    <Hero />
    <Services />
    <Newsletter />
    <Cards />
    <Footer />
  </div>
)

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
