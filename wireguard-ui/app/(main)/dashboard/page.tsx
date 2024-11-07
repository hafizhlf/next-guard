"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Plus, RefreshCw, Settings, Users } from "lucide-react"

interface Client {
  id: number
  name: string
  ip_address: string
  lastSeen: string
}

interface Server {
  id: number
  name: string
  ip_address: string
  port: number
}

export default function WireGuardDashboard() {
  const [clients, setClients] = useState<Client[]>([])
  const [servers, setServers] = useState<Server[]>([])
  const [currentServers, setCurrentServers] = useState<Server>()
  const [newClientName, setNewClientName] = useState("")
  const { toast } = useToast()

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

  const getServerData = (serverId: string) => {
    const selectedServer = servers.find(server => server.id.toString() === serverId)
    if (selectedServer) {
      setCurrentServers(selectedServer)
    }
  }

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await fetch('/api/server')
        if (!response.ok) {
          throw new Error('Failed to fetch servers')
        }
        const data = await response.json()
        setServers(data)
      } catch (err) {
        if (err instanceof Error){
          toast({
            title: "An error occurred",
            description: err.message,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Something wrong",
            description: "An unexpected error occurred",
            variant: "destructive",
          })
        }
      }
    }

    fetchServers()
  }, [toast])

  return (
    <div className="container mx-auto p-4">

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
        <div className="float-right">
          <Select onValueChange={getServerData}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a server" />
            </SelectTrigger>
            <SelectContent>
              {servers.map((server) => (
                <SelectItem key={server.id} value={server.id.toString()}>
                  {server.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
                <Input id="serverIP" className="w-[200px]" value={currentServers?.ip_address || "-"} readOnly disabled />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="serverPort">Server Port</Label>
                  <p className="text-sm text-muted-foreground">The port your WireGuard server listens on</p>
                </div>
                <Input id="serverPort" className="w-[200px]" value={currentServers?.port || "-"} readOnly disabled />
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