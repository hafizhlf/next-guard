"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useSession } from "next-auth/react"
import { useToast } from "hooks/use-toast"
import { Pencil, Trash2, UserPlus } from "lucide-react"

type User = {
  id: number
  username: string
  name: string
  password?: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [newUser, setNewUser] = useState<Omit<User, "id">>({ name: "", username: "", password: "" })
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const { update } = useSession()
  const { toast } = useToast()
  const API_BASE_URL = '/api/users'

  async function handleApiRequest<T>(url: string, method: string, data?: any): Promise<T> {
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: data ? JSON.stringify(data) : undefined,
      })
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `API request failed with status ${res.status}`)
      }
      const response = await res.json()
      console.log(response)
      return response as T
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error("An unexpected error occurred during the API request.")
    }
  }

  const handleError = (error: unknown) => {
    toast({
      title: "Something wrong",
      description: error instanceof Error ? error.message : "An unexpected error occurred",
      variant: "destructive",
    })
  }

  const addUser = async () => {
    try {
      const data = await handleApiRequest<User>(API_BASE_URL, "POST", newUser)
      setUsers([...users, data]);
      setNewUser({ name: "", username: "", password: "" });
      toast({ title: "User Added", description: `${newUser.name} has been added successfully.` })
    } catch (error) { handleError(error) }
  }

  const editUser = (id: number) => {
    const userToEdit = users.find(user => user.id === id)
    setEditingUser(userToEdit || null)
  }

  const updateUser = async () => {
    try {
      if (!editingUser) { throw new Error("No user selected for editing"); }
  
      const updateData = {
        ...(editingUser.name !== undefined && { name: editingUser.name }),
        ...(editingUser.password && { password: editingUser.password })
      }
      await handleApiRequest<User>(`${API_BASE_URL}/${editingUser.id}`, "PUT", updateData)
  
  
      setUsers(users.map(user => user.id === editingUser.id ? { ...user, ...updateData } : user))
      setEditingUser(null)
      await update()
      toast({ title: "User Updated", description: `${editingUser.name}'s information has been updated.` })
    } catch (error) { handleError(error) }
  }

  const deleteUser = async (id: number) => {
    try {
      await handleApiRequest<User>(`${API_BASE_URL}/${id}`, "DELETE")
      setUsers(users.filter(user => user.id !== id))
      toast({ title: "User Deleted", description: "User deleted successfully."})
    } catch (error) { handleError(error) }
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await handleApiRequest<User[]>(API_BASE_URL, "GET")
        setUsers(data)
      } catch (error) { handleError(error) }
    }

    fetchUsers()
  }, [toast])

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New User
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>Enter the details for the new user.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-left sm:text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="col-span-3 w-full"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-left sm:text-right">
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      className="col-span-3 w-full"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-left sm:text-right">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="col-span-3 w-full"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button className="w-full sm:w-auto" onClick={addUser}>
                      Add User
                    </Button>
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
                  <TableHead className="p-4">Email</TableHead>
                  <TableHead className="p-4"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="p-4">{user.name}</TableCell>
                    <TableCell className="p-4">{user.username}</TableCell>
                    <TableCell className="p-4">
                      <div className="flex justify-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => editUser(user.id)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="">
                            <DialogHeader>
                              <DialogTitle>Edit User</DialogTitle>
                              <DialogDescription>Update user information.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-left sm:text-right">
                                  Name
                                </Label>
                                <Input
                                  id="edit-name"
                                  value={editingUser?.name || ""}
                                  onChange={(e) =>
                                    setEditingUser(editingUser ? { ...editingUser, name: e.target.value } : null)
                                  }
                                  className="col-span-3 w-full"
                                />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-password" className="text-left sm:text-right">
                                  Password
                                </Label>
                                <Input
                                  id="edit-password"
                                  type="password"
                                  value={editingUser?.password || ""}
                                  onChange={(e) =>
                                    setEditingUser(editingUser ? { ...editingUser, password: e.target.value } : null)
                                  }
                                  className="col-span-3 w-full"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button className="w-full sm:w-auto" onClick={updateUser}>
                                  Update User
                                </Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => deleteUser(user.id)}
                        >
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
    </div>
  )
}