"use client"

import axios from 'axios'
import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertCircle, ChevronDown, LogIn, LogOut, Plus, RefreshCw, Settings, UserPlus, Users } from "lucide-react"

const Navbar = () => {
  const [username, setUsername] = useState("")
  const [fullname, setfullname] = useState("")
  const router = useRouter()

  const handleLogout = () => {
    console.log("Logging out...")
    localStorage.removeItem("token")
    setUsername("")
  }

  const navigateToUserManagement = () => {
    router.push("/user-management")
  }

  useEffect(() => {
    const token = localStorage.getItem("token")

    async function checkToken() {
      if (token) {
        try {
          const response = await axios.get('http://localhost:8000/auth/secure-endpoint', {
            headers: {
              'Authorization': 'Bearer ' + token,
            }
          })
          setUsername(response.data.user.username)
          setfullname(response.data.user.fullname)
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.warn("Unauthorized access. Please log in again.")
            localStorage.removeItem("token")
          } else {
            console.error("An error occurred:", error)
          }
        }
      }
    }

    checkToken()
  }, [])

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <Link href="/"><h1 className="text-2xl font-bold">Next-Guard</h1></Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {username ? (
                  <>
                    {fullname} <ChevronDown className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Account <ChevronDown className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {username ? (
                <>
                  <DropdownMenuItem onClick={navigateToUserManagement}>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Manage Users</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <DropdownMenuItem>
                      <LogIn className="mr-2 h-4 w-4" />
                      <span>Login</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/register">
                    <DropdownMenuItem>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Register
                    </DropdownMenuItem>
                  </Link>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
};

export default Navbar;