import { useState, useEffect } from 'react';
import { API_BASE } from '../config/env';

export const useLanguages = () => {
    const [languages, setLanguages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/languages`);
                if (!response.ok) {
                    throw new Error('Failed to fetch languages');
                }
                const data = await response.json();
                
                // THE FIX IS HERE: We must access the .languages property of the response data.
                if (Array.isArray(data.languages)) {
                    setLanguages(data.languages);
                } else {
                    // Handle cases where the backend response isn't what we expect
                    setLanguages([]);
                    console.warn("Expected 'languages' array in response, but got:", data);
                }

            } catch (e) {
                setError(e.message);
                console.error("Language fetch error:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchLanguages();
    }, []);

    // Return the state for components to use
    return { languages, loading, error };
};