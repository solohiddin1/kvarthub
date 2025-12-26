
import { FiltrIcon,  SearchIcon } from "../assets/icons"
import { HeaderPart } from "../components"

const Header = () => {



  return (
    <>
    <HeaderPart/>
   
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
