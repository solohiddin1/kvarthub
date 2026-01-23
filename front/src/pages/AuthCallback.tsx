import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setTokens } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { refreshUser } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const access = searchParams.get('access');
                const refresh = searchParams.get('refresh');

                console.log('Tokens received:', { access: !!access, refresh: !!refresh });

                if (!access || !refresh) {
                    throw new Error('No authentication tokens received');
                }

                // Decode tokens if they're URL encoded
                const decodedAccess = decodeURIComponent(access);
                const decodedRefresh = decodeURIComponent(refresh);

                // Store tokens
                setTokens(decodedAccess, decodedRefresh);
                console.log('Tokens stored');

                // Refresh user data
                await refreshUser();
                console.log('User refreshed');

                // Show success message
                toast.success('Successfully logged in!');

                // Redirect to home
                navigate('/', { replace: true });
            } catch (error: any) {
                console.error('Auth callback error:', error);
                setError(error.message || 'Authentication failed');
                toast.error(error.message || 'Authentication failed');
                
                // Redirect to login after a short delay
                setTimeout(() => {
                    navigate('/login', { replace: true });
                }, 2000);
            }
        };

        handleCallback();
    }, [searchParams, navigate, refreshUser]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center p-8">
                {error ? (
                    <>
                        <div className="text-red-500 text-5xl mb-4">⚠️</div>
                        <p className="text-xl font-semibold text-red-600 mb-2">Authentication Error</p>
                        <p className="text-gray-600">{error}</p>
                        <p className="text-sm text-gray-500 mt-4">Redirecting to login...</p>
                    </>
                ) : (
                    <>
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#28A453] mx-auto"></div>
                        <p className="mt-6 text-lg font-medium text-gray-700">Completing authentication...</p>
                        <p className="mt-2 text-sm text-gray-500">Please wait...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthCallback;
