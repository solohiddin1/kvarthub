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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const handleCallback = async () => {
            try {
                console.log('Starting auth callback...');
                
                const access = searchParams.get('access');
                const refresh = searchParams.get('refresh');

                console.log('Tokens received:', { 
                    hasAccess: !!access, 
                    hasRefresh: !!refresh,
                    accessLength: access?.length,
                    refreshLength: refresh?.length 
                });

                if (!access || !refresh) {
                    throw new Error('No authentication tokens received');
                }

                // Decode tokens if they're URL encoded
                const decodedAccess = decodeURIComponent(access);
                const decodedRefresh = decodeURIComponent(refresh);

                console.log('Decoded tokens, storing...');
                
                // Store tokens
                setTokens(decodedAccess, decodedRefresh);
                console.log('Tokens stored successfully');

                // Refresh user data
                console.log('Fetching user profile...');
                await refreshUser();
                console.log('User profile fetched successfully');

                if (!isMounted) return;

                // Show success message
                toast.success('Successfully logged in!');
                setLoading(false);

                // Redirect to home
                setTimeout(() => {
                    navigate('/', { replace: true });
                }, 500);
            } catch (error: any) {
                console.error('Auth callback error:', error);
                
                if (!isMounted) return;
                
                const errorMessage = error?.message || error?.toString() || 'Authentication failed';
                setError(errorMessage);
                setLoading(false);
                toast.error(errorMessage);
                
                // Redirect to login after a short delay
                setTimeout(() => {
                    navigate('/login', { replace: true });
                }, 3000);
            }
        };

        handleCallback();

        return () => {
            isMounted = false;
        };
    }, []);  // Empty dependency array - only run once

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center p-8 max-w-md">
                {error ? (
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="text-red-500 text-5xl mb-4">⚠️</div>
                        <p className="text-xl font-semibold text-red-600 mb-2">Authentication Error</p>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <p className="text-sm text-gray-500">Redirecting to login in 3 seconds...</p>
                    </div>
                ) : loading ? (
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#28A453] mx-auto mb-6"></div>
                        <p className="text-lg font-medium text-gray-700 mb-2">Completing authentication...</p>
                        <p className="text-sm text-gray-500">Please wait while we log you in</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="text-green-500 text-5xl mb-4">✓</div>
                        <p className="text-xl font-semibold text-green-600 mb-2">Success!</p>
                        <p className="text-gray-600">Redirecting to home...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthCallback;
