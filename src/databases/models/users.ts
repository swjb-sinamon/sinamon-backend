import { DataTypes, Model } from 'sequelize';
import sequelize from '../index';

interface UsersAttributes {
  uuid: string;
  email: string;
  name?: string;
  department?: number;
  studentGrade?: number;
  studentClass?: number;
  studentNumber?: number;
  password: string;
}

class Users extends Model<UsersAttributes> {
  public uuid!: string;

  public email!: string;

  public name!: string;

  public department!: number;

  public studentGrade!: number;

  public studentClass!: number;

  public studentNumber!: number;

  public password!: string;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

Users.init(
  {
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    email: {
      type: DataTypes.CHAR,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.CHAR,
      allowNull: true
    },
    department: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    studentGrade: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    studentClass: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    studentNumber: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  { sequelize, modelName: 'users', timestamps: true, paranoid: true }
);

export default Users;
