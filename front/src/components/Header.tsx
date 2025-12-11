import { HeaderImg } from "../assets/images"


const Header = () => {
  return (
    <div className='containers flex items-center justify-between pt-[30px]'>
        <img src={HeaderImg} alt="Header Logo" width={150} height={40} />
    </div>
  )
}

export default Header
