// utils/auth.ts
import bcrypt from 'bcryptjs'
import User from '@/models/user'

export async function createUser(
  username: string,
  password: string,
  name: string
) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      username,
      password: hashedPassword,
      name,
    })

    const { password: _, ...userWithoutPassword } = user.toJSON()
    return userWithoutPassword
  } catch (error) {
    console.error('Error creating user:', error)
    throw new Error('Error creating user')
  }
}