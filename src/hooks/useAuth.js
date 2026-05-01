import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/apiClient';

/**
 * Custom hook for authentication and role-based access control.
 * Checks if the user is authenticated and optionally verifies their role.
 *
 * @param {string|null} requiredRole - Role required to access the component ('staff', 'admin', etc.)
 *   Pass null to allow any authenticated user.
 * @param {string} redirectPath - Path to redirect if role check fails (default: '/')
 * @returns {{ user: Object|null, isLoading: boolean, error: string|null }}
 */
export const useAuth = (requiredRole = null, redirectPath = '/') => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const authenticated = await api.auth.isAuthenticated();

                if (!authenticated) {
                    api.auth.redirectToLogin(window.location.pathname);
                    return;
                }

                const currentUser = await api.auth.me();

                if (!currentUser) {
                    throw new Error('User data not found');
                }

                if (requiredRole) {
                    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
                    if (!allowedRoles.includes(currentUser.role)) {
                        navigate(redirectPath);
                        return;
                    }
                }

                setUser(currentUser);
            } catch (err) {
                console.error('Auth error:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [navigate, requiredRole, redirectPath]);

    return { user, isLoading, error };
};

