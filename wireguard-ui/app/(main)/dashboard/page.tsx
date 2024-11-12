"use client"

import { useState, useEffect } from "react"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select"
import { Switch } from "components/ui/switch"
import { useToast } from "hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "components/ui/tabs"
import { AlertCircle, Plus, RefreshCw, Settings, Users, Trash2, QrCode } from "lucide-react"

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

  const addClient = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/peer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newClientName,
          server_id: currentServers?.id,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Error creating server")
      }

      const data = await res.json()

      setClients([
        ...clients,
        {
          id: data.id,
          name: data.name,
          ip_address: data.ip_address,
          lastSeen: "Never",
        },
      ])
      setNewClientName("")
      toast({
        title: "Server Added",
        description: `${data.name} has been added successfully.`,
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          title: "Something wrong",
          description: error.message,
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

  const deletePeer = async (peerId: number) => {
    try {
      const res = await fetch(`/api/peer/${peerId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete peer")
      }

      const data = await res.json()

      setClients(clients.filter(client => client.id !== peerId))
      toast({
        title: "Peer Deleted",
        description: data.message,
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          title: "Something wrong",
          description: error.message,
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

  const getServerData = (serverId: string) => {
    const selectedServer = servers.find(server => server.id.toString() === serverId)
    if (selectedServer) {
      setCurrentServers(selectedServer)
    }
  }

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await fetch("/api/server")
        if (!response.ok) {
          throw new Error("Failed to fetch servers")
        }
        const data = await response.json()
        setServers(data)
      } catch (err) {
        if (err instanceof Error) {
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

  useEffect(() => {
    const fetchPeers = async () => {
      try {
        setClients([])
        const response = await fetch(`/api/server/${currentServers?.id}/peer`)
        if (!response.ok) {
          throw new Error("Failed to fetch peers")
        }
        const data = await response.json()
        if (data && data.length > 0) {
          setClients(prevClients => [
            ...prevClients,
            ...data.map((item: Client) => ({
              id: item.id,
              name: item.name,
              ip_address: item.ip_address,
              lastSeen: "Never",
            })),
          ]);
        }
      } catch (err) {
        if (err instanceof Error) {
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

    if (currentServers) {
      fetchPeers()
    }
  }, [currentServers])

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
                        <div className="flex space-x-2">
                          <Button variant="outline" size="icon">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon">
                            <QrCode className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => deletePeer(client.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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