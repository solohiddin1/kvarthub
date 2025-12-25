import { HeaderImg } from "../assets/images";
import {
  LikedFilledIcon,
  LikedIcon,
  NoteIcon,
  PlusIcon,
  ProfileIcon,
} from "../assets/icons";
import { useAuth } from "../context/AuthContext";
import { NavLink, useLocation, useNavigate } from "react-router";

const HeaderPart = () => {
  const navigate = useNavigate();
  const {  isAuthenticated } = useAuth();
  const location = useLocation();
  const isHome = location.pathname == "/";
  return (
    <div className={`${isHome ? "bg-[#FFFFFF]" : "bg-[#F2F2F2]"}`}>
      <div className="containers flex items-center justify-between py-[15px] sm:py-[30px] px-5 ">
        <img src={HeaderImg} alt="Header Logo" width={150} height={40} />
        <div className="flex items-center gap-4">
          <NavLink
            to={"/saved"}
            className={({ isActive }) =>
              `p-3.5 rounded-[50%] bg-[#0000000D] cursor-pointer border border-transparent  text-[#5C5C5C]  hidden lg:flex duration-300 hover:border-[#28A453] ${
                isActive ? "bg-[#ADEBC2] text-[#28A453]" : "bg-[#0000000D]"
              }`
            }
          >
            {({ isActive }) => (isActive ? <LikedFilledIcon /> : <LikedIcon />)}
          </NavLink>
            <NavLink
              to={"/notification"}
              className={({ isActive }) =>
                `p-3.5 rounded-[50%] bg-[#0000000D] cursor-pointer border border-transparent   text-[#5C5C5C]  flex duration-300 hover:border-[#28A453] ${
                  isActive ? "bg-[#ADEBC2] text-[#28A453]" : "bg-[#0000000D]"
                }`
              }
            >
              <NoteIcon/>
            </NavLink>
          <div
            onClick={() =>
              isAuthenticated ? navigate("/profile") : navigate("/login")
            }
          >
            <NavLink
              to={"/profile"}
              className={({ isActive }) =>
                `p-3.5 rounded-[50%] bg-[#0000000D] cursor-pointer border border-transparent  text-[#5C5C5C]  hidden lg:flex duration-300 hover:border-[#28A453] ${
                  isActive ? "bg-[#ADEBC2] text-[#28A453]" : "bg-[#0000000D]"
                }`
              }
            >
              {({ isActive }) => (isActive ? <ProfileIcon /> : <ProfileIcon />)}
            </NavLink>
          </div>
          <div
            onClick={() => isAuthenticated ?  navigate("/create-listing") : navigate("/profile")}
            className=" items-center py-3 px-4 text-[#28A453] rounded-full bg-[#D6F5E1] cursor-pointer hidden lg:flex"
          >
            <PlusIcon />
            <span className="text-[#28A453] font-medium ">E'lon joylash</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderPart;
