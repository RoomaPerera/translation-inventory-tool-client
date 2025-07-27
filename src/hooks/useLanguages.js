import { useState, useEffect } from 'react';
import { getLanguages } from '../services/authService';

export const useLanguages = () => {
    const [languages, setLanguages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const langs = await getLanguages();
                setLanguages(langs);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLanguages();
    }, []);

    return { languages, loading, error };
};