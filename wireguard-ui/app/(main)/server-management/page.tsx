"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ServerIcon, Pencil, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Server {
  id: number
  name: string
  ip_address: string
  port: number
}

export default function WireGuardDashboard() {
  const [servers, setServers] = useState<Server[]>([])
  const [ipAddress, setIpAddress] = useState("")
  const [newServer, setNewServer] = useState<Omit<Server, "id" | "clients">>({ name: "", ip_address: "", port: 51820 })
  const [editingServer, setEditingServer] = useState<Server | null>(null)
  const { toast } = useToast()

  const addServer = async () => {
    try {
      const res = await fetch('/api/server', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newServer.name,
          ip_address: ipAddress,
          port: newServer.port,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error creating server')
      }

      const data = await res.json()

      const newServerWithId: Server = {
        ...newServer,
        id: data.id,
        ip_address: data.ip_address,
        port: data.port,
      }
      setServers([...servers, newServerWithId])
      setNewServer({ name: "", ip_address: "", port: 51820 })
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

  const editServer = (id: number) => {
    const serverToEdit = servers.find(server => server.id === id)
    if (serverToEdit) {
      setEditingServer(serverToEdit)
    }
  }

  const updateServer = async () => {
    try {
      const updateData: { name?: string, port?: number } = {}

      if (!editingServer) {
        throw new Error('No server selected for editing')
      }

      if (editingServer?.name) {
        updateData.name = editingServer.name
      }

      if (editingServer?.port) {
        updateData.port = editingServer.port
      }

      const res = await fetch(`/api/server/${editingServer?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update server')
      }

      const data = await res.json()
      console.log(data,'data')

      setServers(servers.map(server =>
        server.id === data.id ? data : server
      ))
      setEditingServer(null)

      toast({
        title: "Server Updated",
        description: `${data.name}'s information has been updated.`,
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

  const deleteServer = async (id: number) => {
    try {
      const res = await fetch(`/api/server/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete server')
      }

      const data = await res.json()

      setServers(servers.filter(server => server.id !== id))
      toast({
        title: "Server Deleted",
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

    const getIpAddress = async () => {
      try {
        const response = await fetch('https://icanhazip.com/')
        const ipAddress = await response.text()
        setIpAddress(ipAddress)
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

    getIpAddress()
    fetchServers()
  }, [toast])

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
                      value={ipAddress}
                      disabled
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
                                disabled
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