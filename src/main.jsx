import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthContextProvider } from './context/AuthContext.jsx'
import axios from 'axios';
//import './styles/tailwind.css';

axios.defaults.withCredentials = true;

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthContextProvider>
            <App />
        </AuthContextProvider>
    </StrictMode>,
)
