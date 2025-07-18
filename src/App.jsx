import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContextProvider } from './context/AuthContext';
import Navbar from './components/navBar';
import Login from './pages/login';
import Register from './pages/register';
import HomePage from './pages/HomePage';
import { useAuthContext } from './hooks/useAuthContext';


function PrivateRoute({ children }) {
    const { user } = useAuthContext();
    return user ? children : <Navigate to="/login" />;
}

function AppLayout() {
    const { user } = useAuthContext();

    return (
        <>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
            </Routes>
        </>
    );
}

export default function App() {
    return (
        <AuthContextProvider>
            <Router>
                <AppLayout />
            </Router>
        </AuthContextProvider>
    );
}