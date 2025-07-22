import React from 'react';
import { useAuthContext } from '../hooks/useAuthContext';

export default function Dashboard() {
    const { user } = useAuthContext();
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Welcome, {user?.userName || user?.email}</h1>
            <p>Your role: {user?.role}</p>
            <p>Dashboard content goes here.</p>
        </div>
    );
}