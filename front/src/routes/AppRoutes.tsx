
import { Routes, Route } from "react-router-dom"
import { AuthCallback, Home, Login, Profile, Register, Saved } from "../pages"

const AppRoutes = () => {
  return (
    <>
      <div>
        <div>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/profile" element={<Profile/>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/saved" element={<Saved/>}/>
          </Routes>
        </div>
      </div>
    </>

  )
}

export default AppRoutes