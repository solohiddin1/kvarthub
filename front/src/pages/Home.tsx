import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Home = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

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
    <div className="w-full max-w-[600px] mx-auto">
      {/* Profile Card */}
      <div className="bg-[#F2F2F2] rounded-[24px] p-8 mb-6">
        <h1 className="text-[32px] font-semibold text-[#0F0F0F] mb-6">
          Welcome Back!
        </h1>

        {/* User Info */}
        <div className="space-y-4">
          {/* Profile Picture */}
          {user.google_picture_url && (
            <div className="flex justify-center mb-6">
              <img
                src={user.google_picture_url}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-[#28A453]"
              />
            </div>
          )}

          {/* Name */}
          {(user.first_name || user.last_name) && (
            <div className="bg-white rounded-[20px] p-4">
              <p className="text-[14px] text-[#5C5C5C] mb-1">Name</p>
              <p className="text-[18px] font-semibold text-[#0F0F0F]">
                {user.first_name} {user.last_name}
              </p>
            </div>
          )}

          {/* Email */}
          <div className="bg-white rounded-[20px] p-4">
            <p className="text-[14px] text-[#5C5C5C] mb-1">Email</p>
            <p className="text-[18px] font-semibold text-[#0F0F0F]">
              {user.email}
            </p>
          </div>

          {/* Phone Number */}
          {user.phone_number && (
            <div className="bg-white rounded-[20px] p-4">
              <p className="text-[14px] text-[#5C5C5C] mb-1">Phone Number</p>
              <p className="text-[18px] font-semibold text-[#0F0F0F]">
                +{user.phone_number}
              </p>
            </div>
          )}

          {/* Account Status */}
          <div className="bg-white rounded-[20px] p-4">
            <p className="text-[14px] text-[#5C5C5C] mb-1">Account Status</p>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${user.is_verified ? "bg-[#28A453]" : "bg-orange-500"
                  }`}
              ></div>
              <p className="text-[18px] font-semibold text-[#0F0F0F]">
                {user.is_verified ? "Verified" : "Not Verified"}
              </p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full py-[15px] mt-6 bg-[#28A453] rounded-[32px] text-[20px] font-semibold text-white cursor-pointer hover:opacity-[70%] duration-300 active:scale-98"
        >
          Logout
        </button>
      </div>

      {/* Additional Info Card */}
      <div className="bg-[#E8F5E9] rounded-[24px] p-6 text-center">
        <p className="text-[16px] text-[#0F0F0F]">
          You are successfully logged in! 🎉
        </p>
        <p className="text-[14px] text-[#5C5C5C] mt-2">
          Your account is ready to use.
        </p>
      </div>
    </div>
  );
};

export default Home;
