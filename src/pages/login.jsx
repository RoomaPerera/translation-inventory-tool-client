import React, { useState } from 'react';
import { useLogin } from '../hooks/useLogin';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from "../components/Input";
import Button from "../components/Button";
import gtnLogo from '../assets/images/gtn-logo.png'; // Use our existing logo path
export default function Login() {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const { login, isLoading, error } = useLogin();
const navigate = useNavigate();
const handleSubmit = async e => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
        navigate('/');
    }
};

return (
    <div className="flex h-screen w-full m-0 p-0 overflow-hidden">
        {/* Left Panel */}
        <div className="w-2/5 bg-gradient-to-b from-purple-800 to-teal-500 text-white flex flex-col items-center justify-center p-10">
            <img src={gtnLogo} alt="Company Logo" className="w-32 h-auto mb-2" />
            <h1 className="text-2xl font-semibold w-30 text-center">GTN Portal</h1>
        </div>

        {/* Right Panel */}
        <div className="w-3/5 bg-gray-100 flex items-center justify-center min-h-screen py-8">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
                <h2 className="text-xl font-semibold text-center text-purple-700 mb-6">
                    Log In
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Email Address" id="email" name="email" type="email"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email" required
                    />
                    <Input
                        label="Password" id="password" name="password" type="password"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password" required
                    />
                    {error && ( <p className="text-red-600 font-semibold text-sm pt-1">{error}</p> )}
                    <div className="pt-2">
                       <Button type="submit" disabled={isLoading} className="w-full bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500 py-2.5">
                           {isLoading ? 'Logging in...' : 'Log In'}
                       </Button>
                    </div>
                    <div className="text-sm text-center pt-2">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-purple-700 hover:underline">
                            Sign Up
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    </div>
);
}