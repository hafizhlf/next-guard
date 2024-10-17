"use client"

import axios from 'axios'
import Link from 'next/link'
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertCircle, ChevronDown, LogIn, LogOut, Plus, RefreshCw, Settings, UserPlus, Users } from "lucide-react"

interface Client {
  id: number
  name: string
  ip_address: string
  lastSeen: string
}

export default function WireGuardDashboard() {
  const [clients, setClients] = useState<Client[]>([])
  const [newClientName, setNewClientName] = useState("")
  const [username, setUsername] = useState("")
  const [fullname, setfullname] = useState("")

  const addClient = (e: React.FormEvent) => {
    e.preventDefault()
    if (newClientName) {
      setClients([
        ...clients,
        {
          id: clients.length + 1,
          name: newClientName,
          ip_address: `10.0.0.${clients.length + 2}`,
          lastSeen: "Never",
        },
      ])
      setNewClientName("")
    }
  }

  const handleLogout = () => {
    console.log("Logging out...")
    localStorage.removeItem("token")
    setUsername("")
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

    async function fetchClients() {
      try {
        const response = await axios.get('http://localhost:8000/wireguard/config/list-peers')
        setClients(response.data.peers)
      } catch (error) {
        console.error("Failed to fetch clients:", error)
      }
    }

    fetchClients()
    checkToken()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Next-Guard</h1>
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

      <Tabs defaultValue="clients">
        <TabsList className="mb-4">
          <TabsTrigger value="clients">
            <Users className="w-4 h-4 mr-2" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Server Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Connected Clients</CardTitle>
              <CardDescription>Manage and monitor connected WireGuard clients</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{client.ip_address}</TableCell>
                      <TableCell>{client.lastSeen}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <form onSubmit={addClient} className="mt-4 flex items-end gap-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="newClient">New Client Name</Label>
                  <Input
                    type="text"
                    id="newClient"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Enter client name"
                  />
                </div>
                <Button type="submit">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Client
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Server Settings</CardTitle>
              <CardDescription>Configure your WireGuard server settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="serverIP">Server IP</Label>
                  <p className="text-sm text-muted-foreground">The IP address of the WireGuard server used for client connections.</p>
                </div>
                <Input id="serverIP" className="w-[200px]" defaultValue="10.0.0.1" readOnly disabled/>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="serverPort">Server Port</Label>
                  <p className="text-sm text-muted-foreground">The port your WireGuard server listens on</p>
                </div>
                <Input id="serverPort" className="w-[200px]" defaultValue="51820" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-restart on failure</Label>
                  <p className="text-sm text-muted-foreground">Automatically restart the server if it crashes</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dnsSetting">DNS Settings</Label>
                  <p className="text-sm text-muted-foreground">DNS servers for client devices</p>
                </div>
                <Input id="dnsSetting" className="w-[200px]" defaultValue="1.1.1.1, 1.0.0.1" />
              </div>
              <div className="pt-4">
                <Button>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Apply Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}