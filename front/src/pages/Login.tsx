import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { GoogleLogo, HeaderImg } from "../assets/images";
import { useAuth } from "../context/AuthContext";
import { Custombtn } from "../components";

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  
  console.log(loginWithGoogle);
  

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    

    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || "Login failed. Please check your credentials.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  return (
     <div className="px-5 containers">
      <Link to={"/"}>
        <img className="pt-10" src={HeaderImg} alt="Header Logo" width={150} height={40}/>
      </Link>
      <div className="w-full max-w-[400px] md:w-[472px] bg-[#F2F2F2] rounded-3xl pt-6 pb-10 md:pb-12 mx-auto mt-[100px] md:mt-[120px]">
        <div className="flex justify-between border-b-2 border-[#D9D9D9] relative">
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `block flex-1 text-center pb-2 text-[24px] font-normal relative ${isActive
                ? "text-[#0F0F0F] border-b-2 border-[#0F0F0F] -mb-px"
                : "text-[#D9D9D9]"
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
          <img src={GoogleLogo} alt="Googlelogo" width={24} height={24} />
          <span className="text-[#333333] text-[20px] font-semibold">
            Log in with Google
          </span>
        </div>

        <div className="flex items-center  gap-[7px] my-4 px-8">
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
            className="py-3 pl-6 rounded-[30px] font-semibold text-[18px]  bg-[#0000000D] placeholder:text-[#1C1C1C] w-full outline-none px-10 border border-transparent duration-300!  hover:bg-[#4DB2700D]  hover:placeholder:text-[#5C5C5C] hover:border hover:border-[#28A453]"
            required
          />
          <Custombtn value={password} onChange={(e) => setPassword(e.target.value)} />

          {error && (
            <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-[15px] mt-6 bg-[#28A453] rounded-4xl text-[20px] font-semibold text-white cursor-pointer hover:opacity-70 duration-300 active:scale-98 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>

     </div>
  );
};

export default Login;

