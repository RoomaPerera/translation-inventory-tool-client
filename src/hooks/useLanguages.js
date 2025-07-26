import { useState, useEffect } from 'react';
import { API_BASE } from '../config/env';

export const useLanguages = () => {
    const [languages, setLanguages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE}/api/auth/getLanguages`, { credentials: 'include',signal:AbortController.signal })
            .then(r => r.json())
            .then(j => { setLanguages(j.languages || []); setLoading(false) })
            .catch(e => { setError(e.message); setLoading(false) });
    }, []);

    return { languages, loading, error };
};