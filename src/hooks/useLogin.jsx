import { useState } from 'react';
import { useAuthContext } from './useAuthContext';
import authService from '../services/authService'; // Import the service

export const useLogin = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { dispatch } = useAuthContext();

    const login = async (email, password) => {
        setIsLoading(true);
        setError(null);

        try {
            // Call the service instead of using fetch directly
            const user = await authService.login(email, password);
            
            // Save user to local storage
            localStorage.setItem('user', JSON.stringify(user));
            
            // Dispatch login action
            dispatch({ type: 'LOGIN', payload: user });
            
            setIsLoading(false);
            return true; // Signal success to the component

        } catch (err) {
            // Axios places the server's error message in err.response.data
            setError(err.response?.data?.error || 'Login failed. Please try again.');
            setIsLoading(false);
            return false; // Signal failure
        }
    };

    return { login, isLoading, error };
};