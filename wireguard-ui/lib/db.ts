// lib/db.ts
import { sequelize } from '@/config/database'

export async function initDatabase() {
  try {
    await sequelize.sync()
    console.log('Database synchronized')
  } catch (error) {
    console.error('Database sync error:', error)
  }
}
