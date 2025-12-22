import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { GoogleLogo, HeaderImg } from "../assets/images";
import { useAuth } from "../context/AuthContext";
import { Custombtn, OtpVerification } from "../components";

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
    <div className="px-5 containers">
       <img className="pt-10" src={HeaderImg} alt="Header Logo" width={150} height={40}/>
      <div className="w-full max-w-[400px] md:w-[472px] bg-[#F2F2F2] rounded-3xl pt-6 pb-10 md:pb-12 mx-auto mt-[100px] md:mt-[100px]">
        <div className="flex justify-between border-b-2 border-[#D9D9D9] relative">
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `block flex-1 text-center pb-2 text-[24px] font-normal relative ${isActive
                ? "text-[#0F0F0F] border-b-2 border-[#0F0F0F] mb-px"
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
                ? "text-black border-b-2 border-black -mb-px"
                : "text-[#5C5C5C]"
              }`
            }
          >
            Register
          </NavLink>
        </div>

        <div
          onClick={handleGoogleLogin}
          className="flex items-center justify-center mt-10 gap-[5px] w-[90%] md:w-[350px] mx-auto rounded-[30px] py-[15px] bg-[#0000001A] px-3.5 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img className="w-5 h-5 md:w-6 md:h-6" src={GoogleLogo} alt="Googlelogo" width={24} height={24} />
          <span className="text-[#333333] text-[18px] md:text-[20px] font-semibold">
            Continue with google
          </span>
        </div>

        <div className="flex items-center gap-[7px] my-4  px-8">
          <div className="flex-1 h-px bg-[#0000000D]"></div>
          <span className="text-[#00000066]">or</span>
          <div className="flex-1 h-px bg-[#0000000D]"></div>
        </div>

        <form onSubmit={handleSubmit} className="w-full px-3.5 md:w-[400px] md:mx-auto ">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="py-3 pl-6 rounded-[30px] font-semibold text-[18px]  bg-[#0000000D] placeholder:text-[#1C1C1C] w-full outline-none border border-transparent duration-300  hover:bg-[#4DB2700D]  hover:border hover:border-[#28A453]"
            required
          />
          <Custombtn value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="relative w-full mt-3 bg-[#0000000D]  rounded-4xl">
            <span className="text-[18px] text-[#1C1C1C]!  absolute left-5 top-3 !hover:text-[#00000080]">
              +998
            </span>
            <div className="w-px h-5 bg-[#BFBFBF] block absolute left-18 top-4"></div>
            <input
              type="tel"
              maxLength={9}
              placeholder="00 000 00 00"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="py-3 pl-[85px] w-full rounded-[30px] font-normal text-[18px]  outline-none border border-transparent duration-300  hover:bg-[#4DB2700D] hover:placeholder:text-[#00000080] hover:border hover:border-[#28A453]"
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
            className="w-full py-[15px] mt-6 bg-[#28A453] rounded-4xl text-[20px] font-semibold text-white cursor-pointer hover:opacity-70 duration-300 active:scale-98 disabled:opacity-50"
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
    </div>
  );
};

export default Register;

