"use client"
import { signOut } from 'next-auth/react'
import toast from 'react-hot-toast'
import { LogOut } from 'lucide-react'

const LogoutButton = () => {
    

    const logout = async () => {
        try {
            await signOut()
        } catch (error) {
            console.log(error)
            toast.error("Error in signing out")
        }
    }

  return (
      <button onClick={logout} className="flex gap-2 items-center btn btn-sm btn-error" >
          <LogOut className="size-5" />
          <span className="hidden sm:inline">Logout</span>
      </button>
  )
}

export default LogoutButton