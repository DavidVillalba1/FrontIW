import React from 'react'
import ReactDOM from 'react-dom/client';
import App from './App.jsx'
import './custom.scss';
import { AuthProvider } from './components/Context/AuthContext';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
