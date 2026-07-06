import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker and listen for updates
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('SW Update Available: Dispatching sw-update-available event');
    window.dispatchEvent(new CustomEvent('sw-update-available', { detail: { updateSW } }));
  },
  onOfflineReady() {
    console.log('SW Offline Ready: Salah Directory is now offline-ready');
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
