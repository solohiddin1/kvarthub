// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://207.154.247.141';

// API Endpoints
export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        REGISTER: '/api/users/auth/register/',
        VERIFY_OTP: '/api/users/auth/verify-otp/',
        LOGIN: '/api/users/auth/login/',
        GOOGLE_LOGIN: '/api/users/auth/google/login/',
        GOOGLE_CALLBACK: '/accounts/google/login/callback/',
    },
    // User
    USER: {
        PROFILE: '/api/users/get-profile/',
        UPDATE_PROFILE: '/api/users/profile-update/',
        UPDATE_IMAGE: '/api/users/profile-image-update/',
    },
    // Password
    PASSWORD: {
        FORGOT_OTP: '/api/users/otp-forgot-password/',
        VERIFY_FORGOT: '/api/users/verify-forgot-password/',
        RESET: '/api/users/password-reset/',
    },
};
