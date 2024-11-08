import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Server extends Model {
  declare id: number;
  declare name: string;
  declare private_key: string;
  declare ip_address: string;
  declare status: string;
  declare port: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Server.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  private_key: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  ip_address: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  port: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Online', 'Offline', 'Maintenance'),
    defaultValue: 'Offline',
  },
}, {
  sequelize,
  modelName: 'Server',
  tableName: 'servers',
  timestamps: true
});

export default Server;