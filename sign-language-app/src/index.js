import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';  // Import global styles
import App from './App';  // Import the main App component
import reportWebVitals from './reportWebVitals';  // Optional: Web vitals for performance tracking

// Render the React app to the DOM
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);


// Optional: Web vitals for performance
reportWebVitals();
