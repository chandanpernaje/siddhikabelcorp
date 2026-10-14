import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global fetch override to automatically inject JWT token
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  const token = localStorage.getItem('token');
  
  if (token) {
    if (!config) config = {};
    if (!config.headers) config.headers = {};
    
    // Add Authorization header if it doesn't exist
    if (config.headers instanceof Headers) {
      if (!config.headers.has('Authorization')) {
        config.headers.append('Authorization', `Bearer ${token}`);
      }
    } else if (Array.isArray(config.headers)) {
      if (!config.headers.some(([key]) => key.toLowerCase() === 'authorization')) {
        config.headers.push(['Authorization', `Bearer ${token}`]);
      }
    } else {
      const headersRecord = config.headers as Record<string, string>;
      const hasAuth = Object.keys(headersRecord).some(key => key.toLowerCase() === 'authorization');
      if (!hasAuth) {
        headersRecord['Authorization'] = `Bearer ${token}`;
      }
    }
  }
  return originalFetch(resource, config);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
