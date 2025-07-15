import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContextProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { useAuthContext } from './hooks/useAuthContext';

function PrivateRoute({ children }) {
    const { user } = useAuthContext();
    return user ? children : <Navigate to="/login" />;
}

export default function App() {
    return (
        <AuthContextProvider>
            <Router>
                <Navbar />
                <div className="container mx-auto mt-6">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    </Routes>
                </div>
            </Router>
        </AuthContextProvider>
    );
}