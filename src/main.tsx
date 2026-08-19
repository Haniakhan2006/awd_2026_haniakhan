import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

// Safely catch and silence benign development WebSocket/HMR connection rejections and cross-origin script errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = reason?.message || String(reason || '');
    if (
      msg.toLowerCase().includes('websocket') || 
      msg.toLowerCase().includes('hmr') ||
      msg.toLowerCase().includes('failed to connect') ||
      msg.toLowerCase().includes('handshake') ||
      msg.toLowerCase().includes('script error')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (
      msg.toLowerCase().includes('websocket') || 
      msg.toLowerCase().includes('hmr') ||
      msg.toLowerCase().includes('failed to connect') ||
      msg.toLowerCase().includes('handshake') ||
      msg.toLowerCase().includes('script error') ||
      msg === ''
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  window.onerror = function (msg) {
    const message = String(msg || '');
    if (
      message.toLowerCase().includes('websocket') ||
      message.toLowerCase().includes('hmr') ||
      message.toLowerCase().includes('failed to connect') ||
      message.toLowerCase().includes('handshake') ||
      message.toLowerCase().includes('script error')
    ) {
      return true;
    }
    return false;
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
