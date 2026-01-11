import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const reset_token = localStorage.getItem("reset_token");
  const navigate = useNavigate();

  // Parol validation funksiyasi
  const validatePassword = () => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push("❌ Parol kamida 8 belgidan iborat bo'lishi kerak");
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("❌ Parolda kamida bitta katta harf bo'lishi kerak");
    }
    
    if (!/\d/.test(password)) {
      errors.push("❌ Parolda kamida bitta raqam bo'lishi kerak");
    }
    
    if (password !== confirmPassword) {
      errors.push("❌ Parollar bir xil emas");
    }
    
    return errors;
  };

  // Form'ni yuborish
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation tekshirish
    const validationErrors = validatePassword();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // API chaqiruv
    apiClient.post("/api/users/password-reset/", {
      reset_token,
      password
    })
    .then(res => {
      console.log("API Response:", res.data);
      
      if (res.data.success) {
        setSuccess(true);
        
        // 3 soniyadan keyin login sahifasiga o'tish
        setTimeout(() => {
          // LocalStorage'ni tozalash
          localStorage.removeItem("reset_token");
          localStorage.removeItem("forgotPasswordEmail");
          localStorage.removeItem("otpCode");
          localStorage.removeItem("reset_id");
          
          navigate('/login', { 
            state: { 
              message: '✅ Parol muvaffaqiyatli o\'zgartirildi!' 
            } 
          });
        }, 3000);
        
      } else {
        setError(res.data.error?.message || "Parol o'zgartirish muvaffaqiyatsiz");
      }
    })
    .catch(error => {
      console.log("API Error:", error);
      
      if (error.response?.data?.error) {
        setError(error.response.data.error.message || "Server xatosi");
      } else {
        setError("🌐 Internet aloqasi xatosi");
      }
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Parol validation holatini tekshirish
  const isPasswordValid = password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
  const isConfirmPasswordValid = password === confirmPassword && confirmPassword.length > 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Yangi Parolni Kiriting</h1>
          <p className="text-gray-600">Iltimos, yangi parolingizni ikki marta kiriting</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-green-800">Parol muvaffaqiyatli o'zgartirildi!</h3>
                    <p className="text-green-600 mt-1">Login sahifasiga yo'naltirilmoqdasiz...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && !success && (
              <div className="mb-6 p-4 bg-linear-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-red-800">Xatolik!</h3>
                    <div className="text-red-600 mt-1">
                      {error.split('\n').map((line, index) => (
                        <p key={index} className="mt-1">{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            {!success && (
              <form onSubmit={handleSubmit}>
                {/* New Password */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Yangi Parol
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      className={`w-full px-4 py-3 pl-12 pr-12 text-gray-700 bg-gray-50 border ${
                        password.length > 0 && !isPasswordValid
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-xl focus:ring-2 focus:outline-none transition-all duration-200`}
                      placeholder="Kamida 8 belgi"
                      required
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {/* Parol Validation Indicator */}
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center text-sm">
                      <div className={`w-2 h-2 rounded-full mr-2 ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                        Kamida 8 belgi {password.length >= 8 && '✓'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className={`w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                        Katta harf {/[A-Z]/.test(password) && '✓'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className={`w-2 h-2 rounded-full mr-2 ${/\d/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={/\d/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                        Raqam {/\d/.test(password) && '✓'}
                      </span>
                    </div>
                  </div>
                  
                  {password.length > 0 && isPasswordValid && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-green-600 text-sm font-medium flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Barcha parol talablari bajarildi!
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Parolni Takrorlang
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError('');
                      }}
                      className={`w-full px-4 py-3 pl-12 pr-12 text-gray-700 bg-gray-50 border ${
                        confirmPassword.length > 0 && !isConfirmPasswordValid
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-xl focus:ring-2 focus:outline-none transition-all duration-200`}
                      placeholder="Parolni qayta kiriting"
                      required
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {/* Parol bir xilligi ko'rsatgichi */}
                  {confirmPassword.length > 0 && (
                    <div className="mt-3">
                      {isConfirmPasswordValid ? (
                        <div className="flex items-center text-green-600">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm">Parollar mos keladi</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="text-sm">Parollar bir xil emas</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Button - FAQAT BARCHA TALABLAR BAJARILGANDA YOQILADI */}
                <button
                  type="submit"
                  disabled={isLoading || !isPasswordValid || !isConfirmPasswordValid}
                  className="w-full py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-3"></div>
                      Saqlanmoqda...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Parolni Saqlash
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Back to Login */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kirish sahifasiga qaytish
              </button>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mt-8">
          <div className="flex items-center justify-center mb-2">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold shadow-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="w-20 h-1 bg-blue-600"></div>
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold shadow-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="w-20 h-1 bg-blue-600"></div>
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold shadow-lg">
              3
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 max-w-xs mx-auto">
            <span className="font-medium text-blue-600">Email</span>
            <span className="font-medium text-blue-600">Kod Tasdiqlash</span>
            <span className="font-medium text-blue-600">Yangi Parol</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;