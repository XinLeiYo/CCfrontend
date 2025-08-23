// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';

// 這是 AuthContext 的匯出，使用具名匯出 (named export)
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null); 
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        if (storedToken && storedUsername) {
            setIsAuthenticated(true);
            setUsername(storedUsername);
            setToken(storedToken);
        }
        setLoading(false);
    }, []);

    const login = (token, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('username', user);
        setToken(token);
        setIsAuthenticated(true);
        setUsername(user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setToken(null);
        setIsAuthenticated(false);
        setUsername(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, username, login, logout, loading, token }}>
            {children}
        </AuthContext.Provider>
    );
};