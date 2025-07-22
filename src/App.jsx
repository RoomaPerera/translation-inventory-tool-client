// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import ProtectedLayout from './components/ProtectedLayout';

// Public pages
import Login from './pages/Login';
import Register from './pages/Register';

// Protected pages
import Home from './pages/Home';
import AllEntries from './pages/AllEntries';
import ActivityLog from './pages/ActivityLog';
import Settings from './pages/Settings';

function App() {
    return (
        <Router>
            <Routes>
                {/* PUBLIC */}
                <Route
                    path="/login"
                    element={<Login />}
                />
                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* PROTECTED */}
                <Route element={<ProtectedLayout />}>
                    {/* when someone hits "/", Home will render inside the protected layout */}
                    <Route path="/" element={<Home />} />
                    <Route path="/all-entries" element={<AllEntries />} />
                    <Route path="/activity-log" element={<ActivityLog />} />
                    <Route path="/settings" element={<Settings />} />
                    {/* catch‑all for anything else: back to Home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>

                {/* if they go to some random URL not matched above, send them to /login if not logged in */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;