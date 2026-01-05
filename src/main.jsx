import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/main.scss'
import App from './App.jsx'
import { fetchCSRFToken } from './services/api'

// Fetch CSRF token on app startup
fetchCSRFToken().catch(err => console.warn('Failed to fetch CSRF token:', err));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
