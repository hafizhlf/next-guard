"use client"

import { useCallback, useState, useEffect } from "react"
import Link from "next/link"
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
import { useToast } from "hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { AlertCircle, Download, Plus, Settings, Users, Trash2, QrCode } from "lucide-react"
import { QRCodeSVG } from 'qrcode.react'

interface Client {
  id: number
  name: string
  ip_address: string
  private_key: string
  preshared_key: string
  received: string
  sent: string
  config: string
}

interface Server {
  id: string
  name: string
  ip_address: string
  port: number
  public_key: number
  public_ip: string
  dns: string
}

export default function WireGuardDashboard() {
  const [clients, setClients] = useState<Client[]>([])
  const [servers, setServers] = useState<Server[]>([])
  const [currentServers, setCurrentServers] = useState<Server>({
    id: "",
    name: "",
    ip_address: "",
    port: 0,
    public_key: 0,
    public_ip: "",
    dns: "",
  })
  const [newClientName, setNewClientName] = useState("")
  const { toast } = useToast()

  const addClient = async () => {
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
          private_key: data.private_key,
          preshared_key: data.preshared_key,
          received: "0.00 KB",
          sent: "0.00 KB",
          config:
            `[Interface]
PrivateKey = ${data.private_key}
Address = ${data.ip_address}/24
DNS = ${currentServers?.dns || '1.1.1.1'}
MTU = 1280

[Peer]
PublicKey = ${currentServers?.public_key}
PresharedKey = ${data.preshared_key}
AllowedIPs = 0.0.0.0/0
Endpoint = ${currentServers?.public_ip}:${currentServers?.port}`,
        },
      ])
      setNewClientName("")
      const res_reload = await fetch(`/api/server/${currentServers?.id}/reload`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!res_reload.ok) {
        const data = await res_reload.json()
        throw new Error(data.error || "Error creating server")
      }
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
      const res_reload = await fetch(`/api/server/${currentServers?.id}/reload`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!res_reload.ok) {
        const data = await res_reload.json()
        throw new Error(data.error || "Error creating server")
      }
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

  const getServerData = useCallback((serverId: string) => {
    const selectedServer = servers.find(server => server.id === serverId)
    if (selectedServer) {
      setCurrentServers(selectedServer)
    }
  }, [servers])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target

    setCurrentServers((prevSettings) => ({
      ...prevSettings,
      [id]: value
    }))
  }

  const handleSubmit = async () => {
    const updateData: { public_ip?: string, port?: number, dns?: string } = {}

    if (currentServers?.public_ip) updateData.public_ip = currentServers.public_ip
    if (currentServers?.port) updateData.port = currentServers.port
    if (currentServers?.dns) updateData.dns = currentServers.dns

    try {
      const res = await fetch(`/api/server/${currentServers?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      const data = await res.json()

      toast({
        title: "Server configuration updated",
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
        if (currentServers.id) {
          const response = await fetch(`/api/server/${currentServers?.id}/peer`)
          if (!response.ok) {
            throw new Error("Failed to fetch peers")
          }
          const data = await response.json()
          setClients([])
          if (data && data.length > 0) {
            setClients(prevClients => [
              ...prevClients,
              ...data.map((item: Client) => ({
                id: item.id,
                name: item.name,
                ip_address: item.ip_address,
                private_key: item.private_key,
                preshared_key: item.preshared_key,
                received: item.received,
                sent: item.sent,
                config:
                  `[Interface]
PrivateKey = ${item.private_key}
Address = ${item.ip_address}/24
DNS = ${currentServers?.dns || '1.1.1.1'}
MTU = 1280

[Peer]
PublicKey = ${currentServers?.public_key}
PresharedKey = ${item.preshared_key}
AllowedIPs = 0.0.0.0/0
Endpoint = ${currentServers?.public_ip}:${currentServers?.port}`
              })),
            ]);
          }
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
      const intervalId = setInterval(fetchPeers, 5000)
      return () => clearInterval(intervalId)
    }
  }, [currentServers, toast])

  useEffect(() => {
    if (servers.length > 0) {
      getServerData(servers[0].id)
    }
  }, [servers, getServerData])

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="clients">
        <TabsList className="mb-4 w-full sm:w-[250px]">
          <TabsTrigger value="clients" className="w-full sm:w-auto">
            <Users className="w-4 h-4 mr-2" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="settings" className="w-full sm:w-auto">
            <Settings className="w-4 h-4 mr-2" />
            Server Settings
          </TabsTrigger>
        </TabsList>

        <div className="sm:text-right mb-4 float-none sm:float-right">
          <Select value={currentServers?.id} onValueChange={getServerData}>
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Select a server" />
            </SelectTrigger>
            <SelectContent>
              {servers.map((server) => (
                <SelectItem key={server.id} value={server.id}>
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
              <div className="mb-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Client
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Client</DialogTitle>
                      <DialogDescription>Enter the details of the new client below.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                        <Label htmlFor="client-name">
                          Name
                        </Label>
                        <Input
                          id="client-name"
                          value={newClientName}
                          onChange={(e) => setNewClientName(e.target.value)}
                          className="sm:col-span-3 w-full"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button className="w-full sm:w-auto" onClick={addClient}>Add Client</Button>
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
                      <TableHead className="p-4">Received</TableHead>
                      <TableHead className="p-4">Sent</TableHead>
                      <TableHead className="p-4"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="p-4">{client.name}</TableCell>
                        <TableCell className="p-4">{client.ip_address}</TableCell>
                        <TableCell className="p-4">{client.received}</TableCell>
                        <TableCell className="p-4">{client.sent}</TableCell>
                        <TableCell className="p-4">
                          <div className="flex justify-center gap-2 text-end">
                            <Link href={`/api/peer/${client.id}`} target="_blank">
                              <Button variant="outline" size="icon">
                                <Download className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <QrCode className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogTitle>QR Code</DialogTitle>
                                <DialogDescription>Scan the QR code for client details.</DialogDescription>
                                <div className="flex justify-center">
                                  <QRCodeSVG value={client.config} size={256} />
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="icon" onClick={() => deletePeer(client.id)}>
                              <Trash2 className="h-4 w-4" />
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
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Server Settings</CardTitle>
              <CardDescription>Configure your WireGuard server settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="w-full sm:w-[48%]">
                  <Label htmlFor="public_ip">Server IP</Label>
                  <p className="text-sm text-muted-foreground">The IP address of the WireGuard server used for client connections.</p>
                </div>
                <Input
                  id="public_ip"
                  className="w-full sm:w-[200px]"
                  value={currentServers?.public_ip}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="w-full sm:w-[48%]">
                  <Label htmlFor="port">Server Port</Label>
                  <p className="text-sm text-muted-foreground">The port your WireGuard server listens on</p>
                </div>
                <Input
                  id="port"
                  className="w-full sm:w-[200px]"
                  value={currentServers?.port}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="w-full sm:w-[48%]">
                  <Label htmlFor="dns">DNS Settings</Label>
                  <p className="text-sm text-muted-foreground">DNS servers for client devices</p>
                </div>
                <Input
                  id="dns"
                  className="w-full sm:w-[200px]"
                  value={currentServers?.dns || "1.1.1.1"}
                  onChange={handleChange}
                />
              </div>

              <div className="pt-4">
                <Button className="w-full sm:w-auto" onClick={handleSubmit}>
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