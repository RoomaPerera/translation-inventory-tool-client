import { createContext, useReducer, useEffect } from 'react';

export const AuthContext = createContext();

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return { ...state, user: action.payload, authReady: true };
        case 'LOGOUT':
            return { ...state, user: null, authReady: true };
        case 'AUTH_READY':
            return { ...state, authReady: true };
        default:
            return state;
    }
};

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        user: null,
        authReady: false,
    });

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            dispatch({ type: 'LOGIN', payload: JSON.parse(stored) });
        } else {
            dispatch({ type: 'AUTH_READY' });
        }
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};