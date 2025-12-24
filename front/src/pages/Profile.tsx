import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Profile = () => {
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
      <div className="bg-[#F2F2F2] rounded-3xl p-8 mb-6">
        
        <h1 className="text-[32px] font-semibold text-[#0F0F0F] mb-6">
          Welcome Back!
        </h1>

        {/* Wrapper for info cards to keep spacing consistent */}
        <div className="flex flex-col gap-4">
          
          {/* Name - Updated to use full_name only */}
          {user.full_name && (
            <div className="bg-white rounded-[20px] p-4">
              <p className="text-[14px] text-[#5C5C5C] mb-1">Name</p>
              <p className="text-[18px] font-semibold text-[#0F0F0F]">
                {user.full_name}
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
                className={`w-3 h-3 rounded-full ${
                  user.is_verified ? "bg-[#28A453]" : "bg-orange-500"
                }`}
              ></div>
              <p className="text-[18px] font-semibold text-[#0F0F0F]">
                {user.is_verified ? "Verified" : "Not Verified"}
              </p>
            </div>
          </div>
        </div> {/* This closes the "flex flex-col gap-4" wrapper */}

        {/* My Listings Button */}
        <button
          onClick={() => navigate("/my-listings")}
          className="w-full py-[15px] mt-8 bg-[#2196F3] rounded-4xl text-[20px] font-semibold text-white cursor-pointer hover:opacity-70 duration-300 active:scale-98"
        >
          My Listings
        </button>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full py-[15px] mt-4 bg-[#28A453] rounded-4xl text-[20px] font-semibold text-white cursor-pointer hover:opacity-70 duration-300 active:scale-98"
        >
          Logout
        </button>
      </div>

      {/* Additional Info Card */}
      <div className="bg-[#E8F5E9] rounded-3xl p-6 text-center">
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

export default Profile;