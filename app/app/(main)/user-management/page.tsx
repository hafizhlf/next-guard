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
  password: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [newUser, setNewUser] = useState<Omit<User, "id">>({ name: "", username: "", password: "" })
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const { update } = useSession()
  const { toast } = useToast()

  const addUser = async () => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newUser.name,
          username: newUser.username,
          password: newUser.password,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Error creating user")
      }

      const data = await res.json()

      setUsers([...users, { ...newUser, id: data.id, password: "" }])
      setNewUser({ name: "", username: "", password: "" })
      toast({
        title: "User Added",
        description: `${newUser.name} has been added successfully.`,
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

  const editUser = (id: number) => {
    const userToEdit = users.find(user => user.id === id)
    setEditingUser(userToEdit || null)
  }

  const updateUser = async () => {
    try {
      // Only send password if it"s being changed
      const updateData: { name?: string, password?: string } = {}

      if (!editingUser) {
        throw new Error("No user selected for editing")
      }

      if (editingUser?.name) {
        updateData.name = editingUser.name
      }

      if (editingUser?.password) {
        updateData.password = editingUser.password
      }

      const res = await fetch(`/api/users/${editingUser?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update user")
      }

      const user: User = editingUser
      user.password = ""
      setEditingUser(user)
      await update()
      setUsers(users.map(user => user.id === editingUser?.id ? editingUser : user))
      setEditingUser(null)
      toast({
        title: "User Updated",
        description: `${editingUser?.name}"s information has been updated.`,
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

  const deleteUser = async (id: number) => {
    try {
      // if (session?.user.id === id.toString()) {
      //   throw new Error("User ID matches the session user ID.")
      // }
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete user")
      }

      const data = await res.json()

      setUsers(users.filter(user => user.id !== id))
      toast({
        title: "User Deleted",
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
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users")
        if (!response.ok) {
          throw new Error("Failed to fetch users")
        }
        const data = await response.json()
        setUsers(data)
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