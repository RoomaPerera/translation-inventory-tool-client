import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
// import { NavBar } from '../components/NavBar';
import NavBar from '../components/reusableComponents/NavBar';
import Home from '../pages/Homepage';
import Login from '../pages/login';
// import Registration from './Registration';
import ButtonDemo from '../pages/ButtonDemo';
import { AuthContext } from '../context/AuthContext';

function AppContent() {
  const { user } = React.useContext(AuthContext);
  const location = useLocation();

  // If not logged in, allow access only to /login and /register
  if (!user && location.pathname !== '/login' && location.pathname !== '/register') {
    return <Navigate to="/login" />;
  }

  // If logged in and on /login, redirect to home
  if (user && location.pathname === '/login') {
    return <Navigate to="/" />;
  }

  // Only show Navbar if not on the login page
  const showNavbar = location.pathname !== '/login';

  return (
    <>
      {showNavbar && <NavBar />}
      <div className="pages">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/button-demo" element={<ButtonDemo />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

