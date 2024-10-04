import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ReactGA from 'react-ga4';

const ga4_id = process.env.REACT_APP_GA || process.env.GA_MEASUREMENT_ID;

const initializeGA = () => {
  if (!ga4_id) {
      console.error("GA Measurement ID is not set. Please check your .env file.");
      return;
  }

  ReactGA.initialize(ga4_id);
  ReactGA.send({ hitType: "pageview", page: window.location.pathname + window.location.search });
};

initializeGA();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

