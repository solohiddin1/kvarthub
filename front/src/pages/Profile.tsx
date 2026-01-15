import { useAuth } from "../context/AuthContext";
import {  useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Footer } from "../modules";
import { HeaderPart } from "../components";
import {
  LikedIcon,
  LogOutIcon,
  PaymentIcon,
  ProfileIcon,
} from "../assets/icons";
import { HomeOutlined, RightOutlined } from "@ant-design/icons";

const Profile = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  let savedCard = localStorage.getItem("savedCard");
  savedCard = savedCard ? JSON.parse(savedCard) : [];
  let product = localStorage.getItem("product");
  product = product ? JSON.parse(product) : [];

  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      // Error handling
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#28A453]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <HeaderPart />

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl transform transition-all duration-300 animate-in fade-in zoom-in">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full animate-pulse">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
            </div>

            {/* Text */}
            <h3 className="text-center text-xl font-bold text-gray-900 mb-2">
              Chiqishni tasdiqlaysizmi?
            </h3>
            <p className="text-center text-gray-600 mb-6">
              Hisobingizdan chiqishni xohlaysizmi?
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={cancelLogout}
                disabled={isLoggingOut}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
              >
                Bekor qilish
              </button>
              <button
                onClick={confirmLogout}
                disabled={isLoggingOut}
                className="flex-1 py-3 px-4 bg-linear-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
              >
                {isLoggingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Chiqilmoqda...</span>
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
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Ha, chiqish</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-6 sm:pt-[60px] pb-30 px-4 sm:px-5">
        <h2 className="text-black font-semibold text-[20px] sm:text-[24px] border-b border-[#0000001A] pb-4 sm:pb-[19px]">
         Profil
        </h2>

        {/* Profile header */}
        <div className="flex items-center justify-between pt-6 sm:pt-10 pb-5 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="border border-[#28A453] rounded-full p-1 sm:p-1">
              <div className="text-black p-4 sm:p-6 bg-[#0000000D] rounded-full">
                <ProfileIcon className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <strong className="text-[#242426] font-semibold text-[18px] sm:text-[32px]">
                {user.full_name}
              </strong>
              <p className="text-sm sm:text-base text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>

        {/* List */}
        <ul className="space-y-1">
          <li
            onClick={() => navigate("/my-listings")}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center  gap-3 flex-1">
              <div className="p-3 sm:p-5  bg-[#F2F2F2] rounded-full flex items-center justify-center">
                <HomeOutlined className="text-[18px] sm:text-[19px]" />
              </div>

              <div className="border-b flex-1 pb-2 border-[#E7E6E5]">
                <strong className="text-black text-[16px] sm:text-[20px] font-semibold">
                  Mening roʻyxatlarim
                </strong>
                <p className="text-sm sm:text-base text-gray-600">
                  {product?.length ?? 0} ta e'lon
                </p>
              </div>
            </div>

            <RightOutlined className="text-gray-400" />
          </li>

          {/* <li
            onClick={() => navigate("/notification")}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 sm:p-5 bg-[#F2F2F2] rounded-full">
                <NoteIcon />
              </div>

              <div className="border-b flex-1 pb-2 border-[#E7E6E5]">
                <strong className="text-black text-[16px] sm:text-[20px] font-semibold">
                  Notification
                </strong>
                <p className="text-sm sm:text-base text-gray-600">3 message</p>
              </div>
            </div>

            <RightOutlined className="text-gray-400" />
          </li> */}

          <li
            onClick={() => navigate("/saved")}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 sm:p-5 bg-[#F2F2F2] rounded-full">
                <LikedIcon />
              </div>

              <div className="border-b flex-1 pb-2 border-[#E7E6E5]">
                <strong className="text-black text-[16px] sm:text-[20px] font-semibold">
                  Sevimlilar
                </strong>

                <p className="text-sm sm:text-base text-gray-600">
                  {savedCard?.length ?? 0} saqlangan e'lonlar
                </p>
              </div>
            </div>

            <RightOutlined className="text-gray-400" />
          </li>

          <li
            onClick={() => navigate("/payment")}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 sm:p-5 bg-[#F2F2F2] rounded-full">
                <PaymentIcon />
              </div>

              <div className="border-b flex-1 pb-2 border-[#E7E6E5]">
                <strong className="text-black text-[16px] sm:text-[20px] font-semibold">
                  To'lov
                </strong>
                <p className="text-sm sm:text-base text-gray-600">Bepul</p>
              </div>
            </div>

            <RightOutlined className="text-gray-400" />
          </li>

          {/* <li className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 sm:p-5 bg-[#F2F2F2] rounded-full">
                <SupportIcon />
              </div>

              <div className="border-b flex-1 pb-2 border-[#E7E6E5]">
                <strong className="text-black text-[16px] sm:text-[20px] font-semibold">
                  Support
                </strong>
                <p className="text-sm sm:text-base text-gray-600">
                  Online chat
                </p>
              </div>
            </div>

            <RightOutlined className="text-gray-400" />
          </li> */}

          {/* <li className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 sm:p-5 bg-[#F2F2F2] rounded-full">
                <ThemeIcon />
              </div>

              <div className="flex flex-col">
                <strong className="text-black text-[16px] sm:text-[20px] font-semibold">
                  Theme
                </strong>
                <p className="text-sm sm:text-base text-gray-600">Light</p>
              </div>
            </div>
            <Switch />
          </li> */}

          {/* <li className="pt-5 overflow-x-hidden">
            <span className="block min-w-[300px] mx-auto h-px bg-gray-200"></span>
          </li> */}

          {/* Logout Button - Improved Design */}
          <li
            onClick={handleLogout}
            className="flex items-center justify-between p-4 rounded-xl hover:bg-red-50 cursor-pointer transition-all duration-200 active:scale-[0.98] border border-transparent hover:border-red-100"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-linear-to-r from-red-100 to-red-200">
                <LogOutIcon />
              </div>
              <div className="flex flex-col">
                <strong className="text-[18px] sm:text-[20px] font-semibold text-red-600">
                  Chiqish
                </strong>
              </div>
            </div>
            <div className="ml-auto">
              <RightOutlined className="text-red-400" />
            </div>
          </li>
        </ul>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
