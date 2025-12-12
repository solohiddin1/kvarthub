import { NavLink } from "react-router-dom";
import { GoogleLogo } from "../assets/images";
import Custombtn from "../components/Custombtn";
const Login = () => {

  return (
    <div className="w-full max-w-[400px] md:w-[472px] bg-[#F2F2F2] rounded-[24px] pt-[24px] pb-[40px] md:pb-[48px] mx-auto">
      <div className="flex justify-between border-b-[2px] border-[#D9D9D9] relative">
        <NavLink
          to="/login"
          className={({ isActive }) =>
            `block flex-1 text-center pb-2 text-[24px] font-normal relative ${
              isActive
                ? "text-[#0F0F0F] border-b-[2px] border-[#0F0F0F] mb-[-1px]"
                : "text-[#D9D9D9]"
            }`
          }
        >
          Log in
        </NavLink>

        <NavLink
          to="/register"
          className={({ isActive }) =>
            `block flex-1 text-center pb-2 text-[24px] font-normal relative ${
              isActive
                ? "text-black border-b-2 border-black -mb-[1px]"
                : "text-[#5C5C5C]"
            }`
          }
        >
          Register
        </NavLink>
      </div>

      <div className="flex items-center justify-center mt-[40px] gap-[5px] max-w-[260px] md:max-w-[350px] mx-auto rounded-[30px] py-[15px] bg-[#0000001A] px-[14px] cursor-pointer">
        <img src={GoogleLogo} alt="Googlelogo" width={24} height={24} />
        <span className="text-[#333333] text-[20px] font-semibold">
          Log in with Google
        </span>
      </div>

      <div className="flex items-center gap-[7px] my-[16px] md:px-[32px]">
        <div className="flex-1 h-[1px] bg-[#0000000D]"></div>
        <span className="text-[#00000066]">or</span>
        <div className="flex-1 h-[1px] bg-[#0000000D]"></div>
      </div>

      <form  className="w-full px-[14px] md:w-[400px] md:mx-auto ">
        <input  
          type="email"
          placeholder="Email"
          className="py-[12px] pl-[24px] rounded-[30px] font-semibold text-[18px]  bg-[#0000000D] placeholder:text-[#1C1C1C] w-full outline-none px-[40px] border-[1px] border-transparent duration-300  hover:bg-[#4DB2700D]  hover:border-[1px] hover:border-[#28A453]"
          required
        />
        <Custombtn/>

        <button className="w-full py-[15px] mt-[24px] bg-[#28A453] rounded-[32px] text-[20px] font-semibold text-white cursor-pointer hover:opacity-[70%] duration-300 active:scale-98">
          Log in
        </button>
      </form>
    </div>
  );
};

export default Login;
