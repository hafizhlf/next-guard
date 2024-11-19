import { Model, DataTypes } from 'sequelize'
import { sequelize } from '@/config/database'

class Peer extends Model {
  declare id: number
  declare server_id: number
  declare name: string
  declare private_key: string
  declare public_key: string
  declare preshared_key: string
  declare ip_address: string
  declare allowed_ips: string
  declare status: string
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

Peer.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  server_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'servers',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  private_key: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  public_key: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  preshared_key: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ip_address: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  allowed_ips: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Connected', 'Disconnected', 'Pending'),
    defaultValue: 'Disconnected',
  },
}, {
  sequelize,
  modelName: 'Peer',
  tableName: 'peers',
  timestamps: true
})

export default Peer
