import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// Normally #root is in index.html. The fallback matters for the single-file
// build, where the script order is what decides whether the page mounts at all.
const mount =
  document.getElementById('root') ||
  document.body.appendChild(Object.assign(document.createElement('div'), { id: 'root' }));

createRoot(mount).render(<App />);
