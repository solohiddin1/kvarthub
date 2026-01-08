
import AppRoutes from "./routes/AppRoutes"
import { AuthProvider } from "./context/AuthContext"
import { ToastContainer } from "react-toastify"

function App() {
  return (
    <AuthProvider>
      <ToastContainer/>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App

