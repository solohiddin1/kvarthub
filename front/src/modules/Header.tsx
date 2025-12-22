import { useNavigate } from "react-router"
import { FiltrIcon, LikedIcon, NoteIcon, PlusIcon, ProfileIcon, SearchIcon,} from "../assets/icons"
import { HeaderImg } from "../assets/images"
import { useAuth } from "../context/AuthContext"
const Header = () => {
  const navigate = useNavigate()
  
  const { user, loading } = useAuth(); 

  console.log(user );
  console.log((loading));
  
  

  if (loading) {
    return <div>Header yuklanmoqda...</div>; 
  }
   
  return (
    <>
    {/* header part1 */}
    <div className='containers flex items-center justify-between py-[15px] sm:py-[30px] px-5 '>
        <img src={HeaderImg} alt="Header Logo" width={150} height={40}/>
        <ul className="flex items-center gap-4">
          <li onClick={() => navigate("/saved")} className="p-3.5 rounded-[50%] bg-[#0000000D] cursor-pointer border border-transparent  text-[#5C5C5C]  hidden lg:flex duration-300 hover:border-[#28A453]">
            <LikedIcon/>
          </li>
          <li className="p-3.5 rounded-[50%] text-[#5C5C5C] bg-[#0000000D] cursor-pointer border border-transparent duration-300 hover:border-[#28A453]">
            <NoteIcon/>
          </li>
          <li onClick={() => user ? navigate("/profile") : navigate("/login")} className="p-3.5 text-[#333333] rounded-[50%] bg-[#0000000D] cursor-pointer hidden lg:flex border border-transparent duration-300 hover:border-[#28A453]">
            <ProfileIcon/>
          </li>
          <li className=" items-center py-3 px-4 text-[#28A453] rounded-full bg-[#D6F5E1] cursor-pointer hidden lg:flex">
           <PlusIcon/>
            <span className="text-[#28A453] font-medium ">E’lon joylash</span>
          </li>
        </ul>
    </div>
    {/* header part2 */}
    <div className="bg-[#DBF0E2]  py-[30px] sm:py-[70px] px-5">
      <div className="containers flex justify-between">
        <label className="w-[80%] bg-white py-4.5 pl-7 rounded-[30px] block relative border border-transparent duration-300 hover:border-[#28A453]">
          <input type="text" placeholder="Search" className=" text-[#5C5C5C] placeholder:text-[#5C5C5C] w-[80%] outline-none pl-10"/>
          <div className="flex items-center gap-1.5 absolute top-4.5 text-[#1C1C1C]">
            <SearchIcon/>
            <div className="w-px h-5 bg-[#0000001A]"></div>
          </div>
        </label>
        <button className="flex items-center justify-center gap-4.5 py-4.5 rounded-[40px] bg-[#28A453] w-[19%] cursor-pointer duration-300 hover:opacity-80">
          <FiltrIcon/>
          <span className="text-white font-medium hidden md:flex">Filter</span>
        </button>
         
      </div>
     
    </div>
    </>

  )
}

export default Header
