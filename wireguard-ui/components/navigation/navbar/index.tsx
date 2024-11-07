"use client"

import { signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, LogIn, LogOut, UserPlus, Users, Server } from "lucide-react"

const Navbar = () => {
  const [username, setUsername] = useState("")
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      setUsername(session.user?.name || "")
    }
  }, [status, session])

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <Link href="/dashboard"><h1 className="text-2xl font-bold">Next-Guard</h1></Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {username ? (
                  <>
                    {username} <ChevronDown className="ml-2 h-4 w-4" />
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
                  <DropdownMenuItem onClick={ () => (router.push("/user-management")) }>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Manage Users</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={ () => (router.push("/server-management")) }>
                    <Server className="mr-2 h-4 w-4" />
                    <span>Manage Servers</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={ () => (signOut()) }>
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