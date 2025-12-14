import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { GoogleLogo } from "../assets/images";
import Custombtn from "../components/Custombtn";
import OtpVerification from "../components/OtpVerification";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register, verifyOtp, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsAlreadyRegistered(false);
    setLoading(true);

    try {
      const response = await register(email, password, "", `998${phoneNumber}`);
      if (response.success) {
        setShowOtpModal(true);
      } else if (response.error) {
        // Handle error response from backend
        const errorMessage = response.error.message || "Registration failed. Please try again.";
        setError(errorMessage);
        // Check if error code indicates user already registered (-2)
        if (response.error.code === -2) {
          setIsAlreadyRegistered(true);
        }
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      const errorMessage = errorData?.error?.message || "Registration failed. Please try again.";
      setError(errorMessage);
      // Check if error code indicates user already registered (-2)
      if (errorData?.error?.code === -2) {
        setIsAlreadyRegistered(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (code: string) => {
    await verifyOtp(email, code);
    setShowOtpModal(false);
    navigate("/");
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  return (
    <>
      <div className="w-full max-w-[400px] md:w-[472px] bg-[#F2F2F2] rounded-[24px] pt-[24px] pb-[40px] md:pb-[48px] mx-auto">
        <div className="flex justify-between border-b-[2px] border-[#D9D9D9] relative">
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `block flex-1 text-center pb-2 text-[24px] font-normal relative ${isActive
                ? "text-[#0F0F0F] border-b-[2px] border-[#0F0F0F] mb-[-1px]"
                : "text-[#5C5C5C]"
              }`
            }
          >
            Log in
          </NavLink>

          <NavLink
            to="/register"
            className={({ isActive }) =>
              `block flex-1 text-center pb-2 text-[24px] font-normal relative ${isActive
                ? "text-black border-b-2 border-black -mb-[1px]"
                : "text-[#5C5C5C]"
              }`
            }
          >
            Register
          </NavLink>
        </div>

        <div
          onClick={handleGoogleLogin}
          className="flex items-center justify-center mt-[40px] gap-[5px] max-w-[260px] md:max-w-[350px] mx-auto rounded-[30px] py-[15px] bg-[#0000001A] px-[14px] cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img src={GoogleLogo} alt="Googlelogo" width={24} height={24} />
          <span className="text-[#333333] text-[20px] font-semibold">
            Continue with google
          </span>
        </div>

        <div className="flex items-center gap-[7px] my-[16px] px-[4] md:px-[32px]">
          <div className="flex-1 h-[1px] bg-[#0000000D]"></div>
          <span className="text-[#00000066]">or</span>
          <div className="flex-1 h-[1px] bg-[#0000000D]"></div>
        </div>

        <form onSubmit={handleSubmit} className="w-full px-[14px] md:w-[400px] md:mx-auto ">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="py-[12px] pl-[24px] rounded-[30px] font-semibold text-[18px]  bg-[#0000000D] placeholder:text-[#1C1C1C] w-full outline-none border-[1px] border-transparent duration-300  hover:bg-[#4DB2700D]  hover:border-[1px] hover:border-[#28A453]"
            required
          />
          <Custombtn value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="relative w-full mt-[12px] bg-[#0000000D]  rounded-[32px]">
            <span className="text-[18px] !text-[#1C1C1C]  absolute left-[20px] top-[12px] !hover:text-[#00000080]">
              +998
            </span>
            <div className="w-[1px] h-[20px] bg-[#BFBFBF] block absolute left-18 top-4"></div>
            <input
              type="tel"
              maxLength={9}
              placeholder="00 000 00 00"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="py-[12px] pl-[85px] w-full rounded-[30px] font-normal text-[18px]  outline-none border-[1px] border-transparent duration-300  hover:bg-[#4DB2700D] hover:placeholder:text-[#00000080] hover:border-[1px] hover:border-[#28A453]"
            />
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-[20px]">
              <p className="text-red-600 text-sm text-center">{error}</p>
              {isAlreadyRegistered && (
                <p className="text-center mt-2">
                  <NavLink
                    to="/login"
                    className="text-[#28A453] font-semibold hover:underline"
                  >
                    Go to Login →
                  </NavLink>
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-[15px] mt-[24px] bg-[#28A453] rounded-[32px] text-[20px] font-semibold text-white cursor-pointer hover:opacity-[70%] duration-300 active:scale-98 disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>

      {showOtpModal && (
        <OtpVerification
          email={email}
          onVerify={handleVerifyOtp}
          onClose={() => setShowOtpModal(false)}
        />
      )}
    </>
  );
};

export default Register;

