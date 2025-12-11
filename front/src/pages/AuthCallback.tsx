import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setTokens } from '../utils/storage';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { refreshUser } = useAuth();

    useEffect(() => {
        const access = searchParams.get('access');
        const refresh = searchParams.get('refresh');

        if (access && refresh) {
            // Store tokens
            setTokens(access, refresh);

            // Refresh user data
            refreshUser().then(() => {
                // Redirect to home
                navigate('/');
            });
        } else {
            // No tokens found, redirect to login
            navigate('/login');
        }
    }, [searchParams, navigate, refreshUser]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#28A453] mx-auto"></div>
                <p className="mt-4 text-gray-600">Completing authentication...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
