import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Remove splash screen
const splash = document.getElementById('splash');
if (splash) {
  splash.style.transition = 'opacity 0.3s ease';
  splash.style.opacity = '0';
  setTimeout(() => splash.remove(), 300);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
