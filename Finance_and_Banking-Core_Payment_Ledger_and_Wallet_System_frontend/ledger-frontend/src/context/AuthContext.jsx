import { createContext, useContext, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const storedUsername = localStorage.getItem('username');
        const storedEmail = localStorage.getItem('email');
        const storedRole = localStorage.getItem('role');
        const storedProfilePhoto = localStorage.getItem('profilePhoto');
        return storedUsername ? { 
            username: storedUsername, 
            email: storedEmail,
            role: storedRole || 'USER',
            profilePhoto: storedProfilePhoto || ''
        } : null;
    });

    // Calls the EXISTING /api/auth/login endpoint.
    async function login(email, password) {
        const response = await axiosInstance.post('/auth/login', { email, password });
        const { accessToken, username, email: returnedEmail, role, profilePhoto } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('username', username);
        localStorage.setItem('email', returnedEmail);
        localStorage.setItem('role', role || 'USER');
        localStorage.setItem('profilePhoto', profilePhoto || '');

        setUser({ 
            username, 
            email: returnedEmail,
            role: role || 'USER',
            profilePhoto: profilePhoto || ''
        });
    }

    // Calls the EXISTING /api/auth/register endpoint.
    async function register(username, email, password) {
        return await axiosInstance.post("/auth/register/initiate", {
            username,
            email,
            password,
        });
    }

    function verifyLogin(username, email, role, profilePhoto) {
        localStorage.setItem('role', role || 'USER');
        localStorage.setItem('profilePhoto', profilePhoto || '');
        setUser({
            username,
            email,
            role: role || 'USER',
            profilePhoto: profilePhoto || ''
        });
    }

    function updateUserProfile(username, profilePhoto) {
        localStorage.setItem('username', username);
        if (profilePhoto !== undefined) {
            localStorage.setItem('profilePhoto', profilePhoto || '');
        }
        setUser((prev) => ({
            ...prev,
            username,
            profilePhoto: profilePhoto !== undefined ? (profilePhoto || '') : prev.profilePhoto
        }));
    }

    function logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        localStorage.removeItem('role');
        localStorage.removeItem('profilePhoto');
        setUser(null);
    }

    const isAuthenticated = !!localStorage.getItem('accessToken');

    return (
        <AuthContext.Provider value={{ user, login, register, verifyLogin, updateUserProfile, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}