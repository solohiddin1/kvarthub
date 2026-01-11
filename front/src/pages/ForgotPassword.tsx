import { useState } from "react";
import { Link, useNavigate } from "react-router";
import apiClient from "../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  function handleEmailFn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim()) {
      setError("Iltimos, email manzilingizni kiriting");
      return;
    }

    setIsLoading(true);
    setError("");

    // To'g'ridan-to'g'ri API chaqiruv
    apiClient
      .post("/api/users/otp-forgot-password/", { email: email })
      .then((res) => {
        const otpCode: string = res.data.result.otp;
        const reset_id: number = res.data.result.reset_id;

        // Ma'lumotlarni saqlash
        localStorage.setItem("otpCode", otpCode);
        localStorage.setItem("reset_id", JSON.stringify(reset_id));
        localStorage.setItem("forgotPasswordEmail", email);

        console.log("Success:", res.data);

        // Navigatsiya
        navigate("/verif-otp");
      })
      .catch((err) => {
        console.log("Error:", err);
        setError("Email yuborishda xatolik. Qayta urinib ko'ring.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  // Enter tugmasi bilan ishlash
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading && email.trim()) {
      e.preventDefault();
      handleEmailFn(e as any);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-white p-4">
      <div className="w-full max-w-md">
        {/* Back to login link */}
        <div className="mb-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <svg
              className="w-5 h-5 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Login
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Decorative header */}
          <div className="relative h-2 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          {/* Card content */}
          <div className="p-8">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 bg-linear-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div className="absolute -inset-2 bg-linear-to-r from-blue-200 to-purple-200 rounded-2xl blur opacity-30"></div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Reset Password
              </h1>
              <p className="text-gray-600">
                Enter your email address and we'll send you a code to reset your
                password
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-linear-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleEmailFn} className="space-y-6">
              {/* Email input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-0 group-focus-within:opacity-20 transition-opacity duration-300"></div>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onKeyDown={handleKeyDown} // Enter uchun
                    className="relative w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full relative group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
                <div className="relative w-full bg-linear-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:hover:translate-y-0 disabled:hover:shadow-lg">
                  {isLoading ? (
                    <>
                      {/* Loading spinner */}
                      <div className="w-5 h-5 border-2 border-white border-t-transparent border-solid rounded-full animate-spin"></div>
                      <span>Yuborilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Send Reset Code</span>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Footer note */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
            <div className="mt-8 flex justify-center">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
              1
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center font-semibold">
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
          <span className=" font-medium">Kod Tasdiqlash</span>
          <span>Yangi Parol</span>
        </div>

            {/* Loading overlay (agar kerak bo'lsa) */}
            {isLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-white border-t-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white font-medium">
                    Email yuborilmoqda...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
