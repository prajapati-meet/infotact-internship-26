import { createContext, useContext, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const storedUsername = localStorage.getItem('username');
        const storedEmail = localStorage.getItem('email');
        return storedUsername ? { username: storedUsername, email: storedEmail } : null;
    });

    // Calls the EXISTING /api/auth/login endpoint — no backend changes needed.
    async function login(email, password) {
        const response = await axiosInstance.post('/auth/login', { email, password });
        const { accessToken, username, email: returnedEmail } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('username', username);
        localStorage.setItem('email', returnedEmail);

        setUser({ username, email: returnedEmail });
    }

    // Calls the EXISTING /api/auth/register endpoint.
 async function register(username, email, password) {
     return await axiosInstance.post("/auth/register/initiate", {
         username,
         email,
         password,
     });
 }

    function logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        setUser(null);
    }

    const isAuthenticated = !!localStorage.getItem('accessToken');

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}