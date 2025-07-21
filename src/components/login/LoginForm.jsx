import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLogin } from '../../hooks/useLogin';
import { Input } from '../reusableComponents/Input';
import Button from '../reusableComponents/Button';

const LoginForm = () => {
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Email Address"
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
            />
            <Input
                label="Password"
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
            />
            {error && (<p className="text-red-600 font-semibold text-sm pt-1">{error}</p>)}
            <div className="pt-2">
                <Button type="submit" disabled={isLoading} className="w-full bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500 !py-2.5">
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
    );
};

export default LoginForm;