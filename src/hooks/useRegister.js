import { useState } from 'react';
import { useAuthContext } from './useAuthContext';
import { registerUser } from '../services/authService';

export const useRegister = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { dispatch } = useAuthContext();

    const registration = async (userName, email, password, role, languages) => {
        setIsLoading(true);
        setError(null);
        try {
            const newUser = await registerUser(userName, email, password, role, languages);
            setIsLoading(false);
            return newUser;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            return null;
        }
    };

    return { registration, isLoading, error };
};