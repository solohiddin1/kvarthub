// pages/VerifyOTP.tsx
import React, { useState } from "react";
import apiClient from "../services/api";
import { useNavigate } from "react-router";

const VerifyOTP: React.FC = () => {
  const navigate = useNavigate()
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const otpCode = localStorage.getItem("otpCode");
  const resetIdStr = localStorage.getItem("reset_id");
  const reset_id = Number(resetIdStr);
 
  
  // OTP input'larini boshqarish
  const handleChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError(""); // Error'ni tozalash
      setSuccess(""); // Success'ni tozalash

      // Keyingi input'ga o'tish
      if (value && index < 3) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  // Orqaga o'tish Backspace bilan
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // ✅ YANGI: Avtomatik kodni olish tugmasi
  const handleAutoFillCode = () => {
    if (otpCode && otpCode.length === 4) {
      const codeArray = otpCode.split('');
      setOtp(codeArray);
      setError("");
      setSuccess("✅ Kod avtomatik kiritildi! Tasdiqlash tugmasini bosing.");
      
      // Birinchi input'ga focus qaytarish
      const firstInput = document.getElementById('otp-0');
      firstInput?.focus();
    } else {
      setError("❌ LocalStorage'da kod topilmadi yoki noto'g'ri formatda");
    }
  };

  // Tasdiqlash funksiyasi
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);

      const enteredCode = otp.join("");

      if (enteredCode === otpCode) {
        apiClient
          .post("/api/users/verify-forgot-password/", {
            reset_id,
            code: enteredCode,
          })
          .then((res) => {
            if (res.data.success) {
              const reset_token = res.data.result.reset_token;
              localStorage.setItem("reset_token", reset_token);
              
              // ✅ SUCCESS MESSAGE - CHIROYLI
              setSuccess("✅ Kod muvaffaqiyatli tasdiqlandi! Parol sahifasiga yo'naltirilmoqdasiz...");
              
              // 2 soniyadan keyin sahifaga o'tish
              setTimeout(() => {
                navigate("/reset-password");
              }, 2000);
              
            } else {
              // ❌ Backend'dan error
              const errorMsg = res.data.error?.message || "Kod noto'g'ri";
              if (errorMsg.includes('ALREADY_VERIFIED')) {
                setError("⚠️ Bu kod allaqachon tasdiqlangan. Parol sahifasiga o'tasizmi?");
                setTimeout(() => navigate("/reset-password"), 3000);
              } else {
                setError(`❌ ${errorMsg}`);
              }
            }
          })
          .catch((error) => {
            console.log(error);
            // ❌ NETWORK ERROR
            setError("🌐 Server bilan aloqa xatosi. Internetingizni tekshiring.");
          });
      } else {
        // ❌ FRONTEND VALIDATION ERROR
        setError("❌ Kod noto'g'ri. Iltimos, qayta kiriting.");
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Kodni Tasdiqlash</h1>
          <p className="text-gray-600 mt-2">
            Emailingizga yuborilgan kodni kiriting
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            {/* ✅ SUCCESS MESSAGE - CHIROYLI */}
            {success && (
              <div className="mb-6 p-4 bg-linear-to-r from-green-50 to-emerald-100 border-2 border-green-300 rounded-xl animate-pulse">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-linear-t-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-green-800">Muvaffaqiyatli!</h3>
                    <p className="text-green-700 mt-1">{success}</p>
                    <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full animate-progress" style={{width: '100%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ❌ ERROR MESSAGE - CHIROYLI */}
            {error && (
              <div className={`mb-6 p-4 rounded-xl border-2 animate-shake ${
                error.includes('✅') || error.includes('Muvaffaqiyatli') 
                  ? 'bg-linear-to-r from-green-50 to-emerald-100 border-green-300' 
                  : error.includes('⚠️') || error.includes('allaqachon')
                  ? 'bg-linear-to-r from-amber-50 to-orange-100 border-amber-300'
                  : 'bg-linear-to-r from-red-50 to-rose-100 border-red-300'
              }`}>
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
                      error.includes('✅') 
                        ? 'bg-linear-to-r from-green-400 to-emerald-500'
                        : error.includes('⚠️')
                        ? 'bg-linear-to-r from-amber-400 to-orange-500'
                        : 'bg-linear-to-r from-red-400 to-rose-500'
                    }`}>
                      {error.includes('✅') ? (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : error.includes('⚠️') ? (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className={`text-lg font-bold ${
                      error.includes('✅') ? 'text-green-800' :
                      error.includes('⚠️') ? 'text-amber-800' : 'text-red-800'
                    }`}>
                      {error.includes('✅') ? 'Muvaffaqiyatli!' :
                       error.includes('⚠️') ? 'Diqqat!' : 'Xatolik!'}
                    </h3>
                    <p className={`mt-1 ${
                      error.includes('✅') ? 'text-green-700' :
                      error.includes('⚠️') ? 'text-amber-700' : 'text-red-700'
                    }`}>
                      {error.replace('✅ ', '').replace('❌ ', '').replace('⚠️ ', '')}
                    </p>
                    
                    {/* ALREADY_VERIFIED uchun qo'shimcha tugma */}
                    {error.includes('allaqachon') && (
                      <button
                        onClick={() => navigate("/reset-password")}
                        className="mt-3 px-4 py-2 bg-linear-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity shadow-md"
                      >
                        Parol sahifasiga o'tish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* OTP Inputs */}
            <form onSubmit={handleSubmit}>
              <div className="mb-8">
                <label className="block text-center text-sm font-medium text-gray-700 mb-4">
                  4 xonali kodingizni kiriting
                </label>

                <div className="flex justify-center space-x-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`w-16 h-16 text-center text-3xl font-bold border-2 rounded-xl focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 ${
                        error && !error.includes('✅') && !error.includes('Muvaffaqiyatli')
                          ? 'border-red-300 bg-red-50 focus:border-red-500' 
                          : 'border-gray-200 bg-gray-50 focus:border-blue-500'
                      }`}
                      maxLength={1}
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  ))}
                </div>
                
                {/* Kod ko'rsatkich */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Kiritilgan kod: <span className="font-bold text-xl text-blue-600">{otp.join('') || '____'}</span>
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || otp.some((digit) => !digit)}
                className="w-full py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl mb-4"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-3"></div>
                    Tasdiqlanmoqda...
                  </div>
                ) : (
                  "Tasdiqlash"
                )}
              </button>
            </form>

            {/* Yana bir Avtomatik Tugma (pastki qismda) */}
            <div className="mt-4">
              <button
                onClick={handleAutoFillCode}
                className="w-full py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Avtomatik Kodni Kirish
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => window.history.back()}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Orqaga qaytish
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
              1
            </div>
            <div className="w-16 h-1 bg-blue-600"></div>
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center font-semibold">
              3
            </div>
          </div>
        </div>

        <div className="mt-2 flex justify-between text-sm text-gray-600 max-w-xs mx-auto">
          <span className="text-blue-600 font-medium">Email</span>
          <span className="text-blue-600 font-medium">Kod Tasdiqlash</span>
          <span>Yangi Parol</span>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;