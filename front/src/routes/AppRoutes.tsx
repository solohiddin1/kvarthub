
import { Routes, Route } from "react-router-dom"
import { AuthCallback, Home, Login, Profile, Register, Saved, CreateListing, MyListings, ListingDetail, Notification } from "../pages"

const AppRoutes = () => {
  return (
    <>
      <div>
        <div>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/profile" element={<Profile/>} />
            <Route path="/my-listings" element={<MyListings/>} />
            <Route path="/create-listing" element={<CreateListing/>} />
            <Route path="/listing/:id" element={<ListingDetail/>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/saved" element={<Saved/>}/>
            <Route path="/notification" element={<Notification/>}/>
          </Routes>
        </div>
      </div>
    </>

  )
}

export default AppRoutes