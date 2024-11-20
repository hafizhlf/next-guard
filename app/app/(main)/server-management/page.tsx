"use client"

import { useCallback, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ServerIcon, Pencil, Trash2, Square, Play } from "lucide-react"
import { useToast } from "hooks/use-toast"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Server {
  id: number
  name: string
  ip_address: string
  port: number
  status: string
}


export default function ServerManagement() {
  const [servers, setServers] = useState<Server[]>([])
  const [newServer, setNewServer] = useState<Omit<Server, "id" | "clients">>({ name: "", ip_address: "", port: 51820, status: "Offline" })
  const [editingServer, setEditingServer] = useState<Server | null>(null)
  const { toast } = useToast()

  const handleApiRequest = useCallback(async (url: string, options: RequestInit) => {
    try {
      const res = await fetch(url, options)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "API request failed")
      }
      return await res.json()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
      return null
    }
  }, [toast])

  const addServer = async () => {
    const data = await handleApiRequest("/api/server", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newServer),
    })

    if (data) {
      setServers([...servers, data])
      setNewServer({ name: "", ip_address: "", port: 51820, status: "Offline" })
      toast({ title: "Server Added", description: `${data.name} has been added successfully.` })
    }
  }

  const editServer = (id: number) => {
    const serverToEdit = servers.find(server => server.id === id)
    if (serverToEdit) {
      setEditingServer(serverToEdit)
    }
  }

  const updateServer = async () => {
    if (!editingServer) return

    const data = await handleApiRequest(`/api/server/${editingServer.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingServer),
    })

    if (data) {
      setServers(servers.map((server) => (server.id === data.id ? data : server)))
      setEditingServer(null)
      toast({ title: "Server Updated", description: `${data.name}'s information has been updated.` })
    }
  }

  const deleteServer = async (id: number) => {
    const data = await handleApiRequest(`/api/server/${id}`, { method: "DELETE" })
    if (data) {
      setServers(servers.filter((server) => server.id !== id));
      toast({ title: "Server Deleted", description: data.message });
    }
  }

  const toggleServerStatus = async (id: number) => {
    const server = servers.find((s) => s.id === id)
    if (!server) return

    const updatedServer = { ...server, status: server.status === "Online" ? "Offline" : "Online" }

    const data = await handleApiRequest(`/api/server/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: updatedServer.status }),
    })

    if (data) {
      setServers(servers.map((s) => (s.id === id ? data : s)));
      toast({
          title: "Server Updated",
          description: `${data.name}'s status has been updated.`,
      })
    }
  }

  useEffect(() => {
    const fetchServers = async () => {
      const data = await handleApiRequest("/api/server", {});
      if (data) setServers(data);
    }

    fetchServers()
  }, [handleApiRequest])

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
                <Button className="w-full sm:w-auto">
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
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="server-name">
                      Name
                    </Label>
                    <Input
                      id="server-name"
                      value={newServer.name}
                      onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                      className="sm:col-span-3 w-full"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="server-ip">
                      IP Address
                    </Label>
                    <Input
                      id="server-ip"
                      value={newServer.ip_address}
                      onChange={(e) => setNewServer({ ...newServer, ip_address: e.target.value })}
                      className="sm:col-span-3 w-full"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="server-port">
                      Port
                    </Label>
                    <Input
                      id="server-port"
                      type="number"
                      value={newServer.port}
                      onChange={(e) => setNewServer({ ...newServer, port: parseInt(e.target.value) })}
                      className="sm:col-span-3 w-full"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button className="w-full sm:w-auto" onClick={addServer}>Add Server</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="p-4">Name</TableHead>
                  <TableHead className="p-4">IP Address</TableHead>
                  <TableHead className="p-4">Port</TableHead>
                  <TableHead className="p-4"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servers.map((server) => (
                  <TableRow key={server.id}>
                    <TableCell className="p-4">{server.name}</TableCell>
                    <TableCell className="p-4">{server.ip_address}</TableCell>
                    <TableCell className="p-4">{server.port}</TableCell>
                    <TableCell className="p-4">
                      <div className="flex sm:flex-row space-x-2 justify-center">
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
                              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-server-name">
                                  Name
                                </Label>
                                <Input
                                  id="edit-server-name"
                                  value={editingServer?.name || ""}
                                  onChange={(e) => setEditingServer(editingServer ? { ...editingServer, name: e.target.value } : null)}
                                  className="sm:col-span-3 w-full"
                                />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-server-ip">
                                  IP Address
                                </Label>
                                <Input
                                  id="edit-server-ip"
                                  value={editingServer?.ip_address || ""}
                                  onChange={(e) => setEditingServer(editingServer ? { ...editingServer, ip_address: e.target.value } : null)}
                                  className="sm:col-span-3 w-full"
                                />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-server-port">
                                  Port
                                </Label>
                                <Input
                                  id="edit-server-port"
                                  type="number"
                                  value={editingServer?.port || ""}
                                  onChange={(e) => setEditingServer(editingServer ? { ...editingServer, port: parseInt(e.target.value) } : null)}
                                  className="sm:col-span-3 w-full"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button className="w-full sm:w-auto" onClick={updateServer}>Update Server</Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="icon" onClick={() => deleteServer(server.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleServerStatus(server.id)}
                          className={`${server.status === "Online" ? "bg-red-100 hover:bg-red-200" : "bg-green-100 hover:bg-green-200"}`}
                        >
                          {server.status === "Online" ? (
                            <Square className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}