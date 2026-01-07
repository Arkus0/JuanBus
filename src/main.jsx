import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';

// Registrar SW manualmente si es necesario (vite-plugin-pwa lo hace automático)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.ready.then((registration) => {
      console.log('✅ PWA lista:', registration.scope);
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
