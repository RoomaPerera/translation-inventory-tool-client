import { useState } from 'react';
import { useAuthContext } from './useAuthContext';
import { API_BASE } from '../config/env';

export const useRegister = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { dispatch } = useAuthContext();

    const registration = async (userName, email, password, role, languages) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userName, email, password, role, languages })
            });
            const json = await res.json();
            if (!res.ok) {
                setError(json.error || 'Registration failed');
                setIsLoading(false);
                return null;
            }
            localStorage.setItem('user', JSON.stringify(json));
            dispatch({ type: 'LOGIN', payload: json });
            setIsLoading(false);
            return json;
        } catch {
            setError('Network error');
            setIsLoading(false);
            return null;
        }
    };

    return { registration, isLoading, error };
};