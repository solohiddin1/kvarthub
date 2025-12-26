import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Footer } from "../modules";
import { HeaderPart, LogoutButton } from "../components";
import {
  LanguageIcon,
  LikedIcon,
  LogOutIcon,
  NoteIcon,
  PaymentIcon,
  ProfileIcon,
  SupportIcon,
  ThemeIcon,
} from "../assets/icons";
import { RightOutlined } from "@ant-design/icons";
import { DarkMode } from "../assets/images";

const Profile = () => {
  const { user, isAuthenticated, loading } = useAuth();

  let savedCard = localStorage.getItem("savedCard");
  savedCard = savedCard ? JSON.parse(savedCard) : [];

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

  function handleLogout(){
    <LogoutButton/>
  }

  return (
    <>
      <HeaderPart />
      <div className="pt-6 sm:pt-[60px] pb-30 px-4 sm:px-5">
        <h2 className="text-black font-semibold text-[20px] sm:text-[24px] border-b border-[#0000001A] pb-4 sm:pb-[19px]">
          Profile
        </h2>

        {/* Profile header */}
        <div className="flex items-center justify-between pt-6 sm:pt-10 pb-5">
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

          <Link
            to="#"
            className="text-[#28A453] font-normal flex items-center gap-1 shrink-0"
          >
            <span>Enter</span>
            <RightOutlined />
          </Link>
        </div>

        {/* List */}
        <ul>
          <li className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 sm:p-5 bg-[#F2F2F2] rounded-full">
                <LanguageIcon />
              </div>

              <div className="border-b flex-1 pb-2 border-[#E7E6E5]">
                <strong className="text-black text-[16px] sm:text-[20px] font-semibold">
                  Language
                </strong>
                <p className="text-sm sm:text-base text-gray-600">English</p>
              </div>
            </div>

            <RightOutlined />
          </li>
          <li
            onClick={() => navigate("/notification")}
            className="flex items-center justify-between py-3"
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

            <RightOutlined />
          </li>
          <li
            onClick={() => navigate("/saved")}
            className="flex items-center justify-between py-3"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 sm:p-5 bg-[#F2F2F2] rounded-full">
                <LikedIcon />
              </div>

              <div className="border-b flex-1 pb-2 border-[#E7E6E5]">
                <strong className="text-black text-[16px] sm:text-[20px] font-semibold">
                  Favorites
                </strong>

                <p className="text-sm sm:text-base text-gray-600">
                  {savedCard?.length ?? 0}
                </p>
              </div>
            </div>

            <RightOutlined />
          </li>
          <li className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 sm:p-5 bg-[#F2F2F2] rounded-full">
                <PaymentIcon />
              </div>

              <div className="border-b flex-1 pb-2 border-[#E7E6E5]">
                <strong className="text-black text-[16px] sm:text-[20px] font-semibold">
                  Payment
                </strong>
                <p className="text-sm sm:text-base text-gray-600">Free</p>
              </div>
            </div>

            <RightOutlined />
          </li>
          <li className="flex items-center justify-between py-3">
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

            <RightOutlined />
          </li>
          <li className="flex items-center justify-between py-3 relative">
            <div className="flex items-center gap-3 relative flex-1">
              <div className="p-3 sm:p-5 bg-[#F2F2F2] rounded-full relative ">
                <ThemeIcon />
              </div>

              <div className="flex flex-col">
                <strong className="text-black text-[16px] sm:text-[20px] font-semibold">
                  Theme
                </strong>
                <p className="text-sm sm:text-base text-gray-600">Light</p>
              </div>
            </div>

            <img src={DarkMode} alt="Dark mode Icon" className="h-8 w-auto" />
          </li>
          <li className="pt-5 overflow-x-hidden">
            <span className=" block min-w-[300px] mx-auto h-px bg-gray-300"></span>
          </li>
          {/* <li onClick={() =>handleLogout()} className="flex items-center gap-3 py-5 cursor-pointer">
            <div className="p-3 rounded-full bg-red-200">
              <LogOutIcon />
            </div>
            <strong className="text-[24px] font-semibold">Log Out</strong>
          </li> */}
          <li>
            <LogoutButton/>
          </li>
          <li>
            <button
              onClick={() => navigate("/my-listings")}
              className="w-full py-[15px] mt-4 bg-[#2196F3] rounded-4xl text-[20px] font-semibold text-white cursor-pointer hover:opacity-70 duration-300 active:scale-98"
            >
              My Listings
            </button>
          </li>
        </ul>
      </div>

      <Footer />
    </>
  );
};

export default Profile;
