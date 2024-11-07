"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Plus, RefreshCw, Settings, Users, ServerIcon, Pencil, Trash2, UserPlus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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
  clients: Client[]
}

export default function WireGuardDashboard() {
  const [servers, setServers] = useState<Server[]>([
    {
      id: 1,
      name: "Server 1",
      ip_address: "10.0.0.1",
      port: 51820,
      clients: [
        { id: 1, name: "Client 1", ip_address: "10.0.0.2", lastSeen: "5 minutes ago" },
        { id: 2, name: "Client 2", ip_address: "10.0.0.3", lastSeen: "2 hours ago" },
      ],
    },
    {
      id: 2,
      name: "Server 2",
      ip_address: "10.0.1.1",
      port: 51821,
      clients: [
        { id: 1, name: "Client A", ip_address: "10.0.1.2", lastSeen: "1 day ago" },
      ],
    },
  ])
  const [selectedServer, setSelectedServer] = useState<Server>(servers[0])
  const [newClientName, setNewClientName] = useState("")
  const [newServer, setNewServer] = useState<Omit<Server, "id" | "clients">>({ name: "", ip_address: "", port: 51820 })
  const [editingServer, setEditingServer] = useState<Server | null>(null)

  const addClient = (e: React.FormEvent) => {
    e.preventDefault()
    if (newClientName) {
      const updatedServers = servers.map(server => {
        if (server.id === selectedServer.id) {
          return {
            ...server,
            clients: [
              ...server.clients,
              {
                id: server.clients.length + 1,
                name: newClientName,
                ip_address: `10.0.${server.id - 1}.${server.clients.length + 2}`,
                lastSeen: "Never",
              },
            ],
          }
        }
        return server
      })
      setServers(updatedServers)
      setSelectedServer(updatedServers.find(server => server.id === selectedServer.id) || selectedServer)
      setNewClientName("")
    }
  }

  const handleServerChange = (serverId: string) => {
    const server = servers.find(s => s.id === parseInt(serverId))
    if (server) {
      setSelectedServer(server)
    }
  }

  const addServer = () => {
    const newServerId = servers.length + 1
    const newServerWithId: Server = {
      ...newServer,
      id: newServerId,
      clients: [],
    }
    setServers([...servers, newServerWithId])
    setNewServer({ name: "", ip_address: "", port: 51820 })
  }

  const editServer = (id: number) => {
    const serverToEdit = servers.find(server => server.id === id)
    if (serverToEdit) {
      setEditingServer(serverToEdit)
    }
  }

  const updateServer = () => {
    if (editingServer) {
      setServers(servers.map(server =>
        server.id === editingServer.id ? editingServer : server
      ))
      setEditingServer(null)
    }
  }

  const deleteServer = (id: number) => {
    setServers(servers.filter(server => server.id !== id))
    if (selectedServer.id === id) {
      setSelectedServer(servers[0])
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Server Management</CardTitle>
          <CardDescription>Manage WireGuard servers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <ServerIcon className="mr-2 h-4 w-4" />
                  Add New Server
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Server</DialogTitle>
                  <DialogDescription>Enter the details for the new server.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="server-name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="server-name"
                      value={newServer.name}
                      onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="server-ip" className="text-right">
                      IP Address
                    </Label>
                    <Input
                      id="server-ip"
                      value={newServer.ip_address}
                      onChange={(e) => setNewServer({ ...newServer, ip_address: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="server-port" className="text-right">
                      Port
                    </Label>
                    <Input
                      id="server-port"
                      type="number"
                      value={newServer.port}
                      onChange={(e) => setNewServer({ ...newServer, port: parseInt(e.target.value) })}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button onClick={addServer}>Add Server</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Port</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servers.map((server) => (
                <TableRow key={server.id}>
                  <TableCell>{server.name}</TableCell>
                  <TableCell>{server.ip_address}</TableCell>
                  <TableCell>{server.port}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => editServer(server.id)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Server</DialogTitle>
                            <DialogDescription>Update server information.</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-server-name" className="text-right">
                                Name
                              </Label>
                              <Input
                                id="edit-server-name"
                                value={editingServer?.name || ""}
                                onChange={(e) => setEditingServer(editingServer ? { ...editingServer, name: e.target.value } : null)}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-server-ip" className="text-right">
                                IP Address
                              </Label>
                              <Input
                                id="edit-server-ip"
                                value={editingServer?.ip_address || ""}
                                onChange={(e) => setEditingServer(editingServer ? { ...editingServer, ip_address: e.target.value } : null)}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-server-port" className="text-right">
                                Port
                              </Label>
                              <Input
                                id="edit-server-port"
                                type="number"
                                value={editingServer?.port || ""}
                                onChange={(e) => setEditingServer(editingServer ? { ...editingServer, port: parseInt(e.target.value) } : null)}
                                className="col-span-3"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button onClick={updateServer}>Update Server</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="icon" onClick={() => deleteServer(server.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}