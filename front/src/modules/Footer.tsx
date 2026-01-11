import { NavLink, } from "react-router-dom";
import {
  HomeIcon,
  InstagramIcon,
  LikedIcon,
  LinkedinIcon,
  PlusIcon,
  ProfileIcon,
  XlogoIcon,
} from "../assets/icons";
import { DiscordIcon, HeaderImg, YoutubeIcon } from "../assets/images";
import { useAuth } from "../context/AuthContext";


const Footer = () => {
  const {  isAuthenticated } = useAuth()
  
  const district = [
    { id: 1, title: "Yunusobod" },
    { id: 2, title: "Mirobod" },
    { id: 3, title: "Chilonzor" },
    { id: 4, title: "Shayxontohur" },
    { id: 5, title: "Sergeli" },
    { id: 6, title: "Yakkasaroy" },
    { id: 7, title: "Bektemir" },
  ];
  const company = [
    { id: 1, title: "About us" },
    { id: 2, title: "Partners" },
    { id: 3, title: "Careers" },
    { id: 4, title: "Contact" },
  ];

  return (
    <div >
      <div className="bg-[#E0EBE4] pt-5 pb-[67px] hidden px-5 lg:block">
        <div className="containers flex items-start justify-between">
          <img className="lg:w-[150px] lg:h-10" src={HeaderImg} alt="Header logo" width={120} height={40} />
          <ul className="flex flex-col gap-2 lg:mt-3">
            <strong className="text-[18px] lg:text-[24px] text-[#000000]">Tumanlar</strong>
            {district.map((item) => (
              <li key={item.id} className=" text-[16px] lg:text-[18px] text-[#5C5C5C]">
                {item.title}
              </li>
            ))}
          </ul>
          <ul className="flex flex-col gap-2 lg:mt-3">
            <strong className="text-[18px] lg:text-[24px] text-[#000000]">Company</strong>
            {company.map((item) => (
              <li key={item.id} className=" text-[16px] lg:text-[18px] text-[#5C5C5C]">
                {item.title}
              </li>
            ))}
          </ul>
          <ul className="flex items-center gap-3 lg:mt-3">
            <li className="bg-[#28A453] p-4 lg:p-6  rounded-full">
              <img
                src={YoutubeIcon}
                alt="Youtube logo"
                width={32}
                height={32}
              />
            </li>
            <li className="bg-[#28A453] p-4 lg:p-6  rounded-full">
              <LinkedinIcon />
            </li>
            <li className="bg-[#28A453] p-4 lg:p-6  rounded-full">
              <img
                className="w-8 h-8"
                src={DiscordIcon}
                alt="Youtube logo"
                width={32}
                height={32}
              />
            </li>
            <li className="bg-[#28A453] p-4 lg:p-6  rounded-full">
              <InstagramIcon />
            </li>
            <li className="bg-[#28A453] p-4 lg:p-6  rounded-full">
              <XlogoIcon />
            </li>
          </ul>
        </div>
      </div>
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[90%] sm:w-[75%] flex justify-between items-center py-2 px-3 div rounded-[60px] shadow-md lg:hidden">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center justify-center w-12 h-12 rounded-full ${
              isActive ? "bg-[#28A453] text-white" : "bg-white text-black"
            }`
          }
        >
          <HomeIcon className="w-6 h-6" />
        </NavLink>
        <NavLink to={isAuthenticated ? "/create-listing":"/login"}
          
          className={({ isActive }) =>
            `flex items-center justify-center w-12 h-12 rounded-full ${
              isActive ? "bg-[#28A453] text-white" : "bg-white text-black"
            }`
          }
        >
          <PlusIcon className="w-6 h-6" />
        </NavLink>
        <NavLink
          to="/saved"
          className={({ isActive }) =>
            `flex items-center justify-center w-12 h-12 rounded-full ${
              isActive ? "bg-[#28A453] text-white" : "bg-white text-black"
            }`
          }
        >
          <LikedIcon className="w-6 h-6" />
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center justify-center w-12 h-12 rounded-full ${
              isActive ? "bg-[#28A453] text-white" : "bg-white text-black"
            }`
          }
        >
          <ProfileIcon className="w-6 h-6" />
        </NavLink>
      </div>
      
    </div>
  );
};

export default Footer;
