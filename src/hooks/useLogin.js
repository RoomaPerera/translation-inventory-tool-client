import { useState } from 'react';
import { useAuthContext } from './useAuthContext';
import { loginUser } from '../services/authService';

export const useLogin = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuthContext();

    const handleLogin = async (email, password) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await loginUser({ email, password });
            // The cookie is automatically set by the server
            // We just need to update the context with user data
            login({ email: response.data.email });
            setIsLoading(false);
            return true;
        } catch (err) {
            setError(err.response?.data?.error || err.message);
            setIsLoading(false);
            return false;
        }
    };

    return { login: handleLogin, isLoading, error };
};