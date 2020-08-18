import { DataTypes, Model } from 'sequelize';
import sequelize from '../index';

interface OnlineTimeTablesAttributes {
  id?: number;
  subjectId: number;
  teacher: string;
  type: string;
  url: string;
  startTime: Date;
  dayWeek: string;
}

class OnlineTimeTables extends Model<OnlineTimeTablesAttributes> {
  public id!: number;

  public subjectId!: number;

  public teacher!: string;

  public type!: string;

  public url!: string;

  public startTime!: Date;

  public dayWeek!: string;
}

OnlineTimeTables.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      primaryKey: true,
      autoIncrement: true
    },
    subjectId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    teacher: {
      type: DataTypes.CHAR,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    dayWeek: {
      type: DataTypes.CHAR(50),
      allowNull: false
    }
  },
  { sequelize, modelName: 'onlinetimetables', timestamps: false }
);

export default OnlineTimeTables;
