import { useState } from 'react';
import { useAuthContext } from './useAuthContext';

export const useLogout = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { logout } = useAuthContext();

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return { logout: handleLogout, isLoading };
};