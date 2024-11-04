// models/user.ts
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@/config/database';

class User extends Model {
  public id!: number;
  public username!: string;
  public password!: string;
  public name!: string;
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
});

export default User;