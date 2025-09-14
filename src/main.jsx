import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Lab from './views/Lab.jsx'
import './index.css'
import './styles/print.css'
import './styles/decorations.css'
import { startWatchdog } from './startup/watchdog.js'

startWatchdog();

const isLab = window.location.pathname.startsWith('/lab');

const root = ReactDOM.createRoot(document.getElementById('root'));
if (isLab) {
  root.render(<Lab />);
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
