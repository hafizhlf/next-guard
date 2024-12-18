import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@/config/db-connect'

class User extends Model {
  declare id: number;
  declare username: string;
  declare password: string;
  declare name: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'User',
  tableName: 'Users',
  timestamps: true
});

export default User;