// hooks/useLogout.js
import { logout as ReduxLogout } from "../redux/slice/authSlice"
import { useHttpRequest } from "../ContextApi/ContextApi"
import { useDispatch } from "react-redux"
import { clearAllStorage } from "./Helper"
import { persistor } from "../redux/store"
import { API_URL } from '@env'  // react-native-dotenv থেকে import

export const useLogout = () => {
  const { httpRequest } = useHttpRequest()
  const dispatch = useDispatch()

  const handleLogout = async () => {
    try {
      // Use API_URL from .env
      await httpRequest(`${API_URL}/logout`, { method: 'POST' })
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      // Purge redux persist
      persistor.purge()

      // Redux logout
      dispatch(ReduxLogout())

      // Clear other storage
      clearAllStorage()
    }
  }

  return handleLogout
}
