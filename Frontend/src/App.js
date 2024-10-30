import React from 'react';
import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppRoutes from './AppRoutes';
import i18n from './i18n';

function App() {

  useEffect(() => {
    const setLanguageBasedOnDomain = () => {
      const domain = window.location.hostname;

      if (domain === 'bloodflow.eu' || domain === 'www.bloodflow.eu') {
        i18n.changeLanguage('en');
      } else if (domain === 'bloodflow.pt' || domain === 'www.bloodflow.pt') {
        i18n.changeLanguage('pt');
      } else {
        i18n.changeLanguage('en');
      }
    };

    setLanguageBasedOnDomain();
  }, []);

  return (
    <Router>
      <div>
        <AppRoutes />
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
