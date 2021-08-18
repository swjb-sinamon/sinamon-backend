import { DataTypes, Model } from 'sequelize';
import sequelize from '../../index';
import { SubjectType } from '../../../types';

interface SubjectsAttributes {
  id: number;
  name: string;
  description: string;
  type: SubjectType;
  maxPeople: number;
}

class Subjects extends Model<SubjectsAttributes> {
  public id!: number;

  public name!: string;

  public description!: string;

  public type!: SubjectType;

  public maxPeople!: number;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

Subjects.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('SELECT_SUBJECT', 'MAJOR_SUBJECT'),
      allowNull: false
    },
    maxPeople: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  { sequelize, modelName: 'subjects', timestamps: true }
);

export default Subjects;
