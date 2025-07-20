import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContextProvider } from './context/AuthContext';
import Navbar from './components/navBar';
import Login from './pages/login';
import Register from './pages/register';
import HomePage from './pages/HomePage';
// import ProjectLanguageManager from './pages/ProjectLanguageManager';
import { useAuthContext } from './hooks/useAuthContext';
import Projects from './pages/projects';
import ProjectForm from './components/Modals/EditProjectForm';
import LanguageForm from './components/LanguageForm';
import Settings from './pages/settings';
import EditProjectForm from './components/Modals/EditProjectForm';

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
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/add" element={<ProjectForm />} />
                <Route path="/languages/add" element={<LanguageForm />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/settings/projects/edit/:id" element={<EditProjectForm />} />
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