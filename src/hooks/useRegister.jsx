import { useState } from 'react';
import authService from '../services/authService'; // Import the service

export const useRegister = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const registration = async (userName, email, password, role, languages) => {
        setIsLoading(true);
        setError(null);

        try {
            // Call the service for the registration
            const result = await authService.register(userName, email, password, role, languages);
            setIsLoading(false);
            return result; // Return the success message from the backend

        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed.');
            setIsLoading(false);
            return null; // Return null on failure
        }
    };

    return { registration, isLoading, error };
};