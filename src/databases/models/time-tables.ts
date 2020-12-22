import { DataTypes, Model } from 'sequelize';
import sequelize from '../index';

interface TimeTablesAttributes {
  id?: number;
  subject: string;
  teacher: string;
  url: string;
}

class TimeTables extends Model<TimeTablesAttributes> {
  public id!: number;

  public subject!: string

  public teacher!: string;

  public url!: string;
}

TimeTables.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      primaryKey: true,
      autoIncrement: true
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    teacher: {
      type: DataTypes.CHAR,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  { sequelize, modelName: 'timetables', timestamps: false }
);

export default TimeTables;
