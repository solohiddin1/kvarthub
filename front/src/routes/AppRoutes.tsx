
import {   Routes, Route } from "react-router-dom"
import Login from "../pages/Login"
import Register from "../pages/Register"
import Header from "../components/Header"
import { Home } from "../pages"

const AppRoutes = () => {
  return (
    <>
      <Header/>
      <div className="flex justify-center pt-[55px] md:pt-[100px]">
        <div className="containers">
          <Routes>

            <Route path="/" element={<Home/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </div>
    </>
    
  )
}

export default AppRoutes