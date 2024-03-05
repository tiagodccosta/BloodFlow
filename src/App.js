import React from 'react'
import Navbar from './Components/Navbar';
import Hero from './Components/Hero';
import Services from './Components/Services';
import Newsletter from './Components/Newsletter';
import Cards from './Components/Cards';
import Footer from './Components/Footer';


function App() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Services />
      <Newsletter />
      <Cards />
      <Footer />
    </div>
  );
}

export default App;
