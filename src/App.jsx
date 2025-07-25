import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from './hooks/useAuthContext';
import ProtectedLayout from './components/ProtectedLayout';

import Navbar from './components/reusableComponents/navBar';
import Login from './pages/login';
import Register from './pages/register';
import HomePage from './pages/Home';
import AllEntries from './pages/AllEntries';
import ActivityLog from './pages/ActivityLog';
// import ProjectLanguageManager from './pages/ProjectLanguageManager';
import LanguageForm from './components/ProjectLanguageComponents/LanguageForm';
import Settings from './pages/Settings';
import ProjectAndLanguageSettings from './pages/ProjectAndLanguageSettings';
import EditProjectForm from './components/ProjectLanguageComponents/EditProjectForm';

function App() {
    const { authReady } = useAuthContext();

 if (!authReady) {
        return (
            <div className="flex items-center justify-center h-screen">
                <span className="text-xl text-gray-600">Loading...</span>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                // Public Routes
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                // Protected Routes
                <Route element={<ProtectedLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/all-entries" element={<AllEntries />} />
                    <Route path="/activity-log" element={<ActivityLog />} />
                    {/* {/* <Route path="/languages/add" element={<LanguageForm />} /> /} */}
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/settings/projects" element={<ProjectAndLanguageSettings />} />
                    {/* {/ <Route path="/settings/projects/edit/:id" element={<EditProjectForm />} /> */} 

                    <Route path="" element={<Navigate to="/" replace />} />
                    {/* {/ <Route path="/navbar" element={<Navbar user={user} />} /> */} 
                </Route>
            </Routes>
        </Router>
    );
}

export default App;