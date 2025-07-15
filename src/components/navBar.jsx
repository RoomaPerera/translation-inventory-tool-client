import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';

export default function Navbar() {
    const { user, dispatch } = useAuthContext();
    const logout = () => {
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
    };
    return (
        <nav className="bg-gray-800 text-white p-4 flex justify-between">
            <Link to="/" className="font-bold">MyApp</Link>
            <div className="space-x-4">
                {user ? (
                    <>
                        <span>Hello, {user.userName || user.email}</span>
                        <button onClick={logout} className="hover:underline">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="hover:underline">Login</Link>
                        <Link to="/register" className="hover:underline">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}