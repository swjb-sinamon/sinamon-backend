import { DataTypes, Model } from 'sequelize';
import sequelize from '../../index';
import { ApplicationType } from '../../../types';

interface SubjectDataAttributes {
  id?: number;
  subjectId: number;
  maxPeople: number;
  currentPeople: number;
  applicationType: ApplicationType;
}

class SubjectData extends Model<SubjectDataAttributes> {
  public id!: number;

  public subjectId!: number;

  public maxPeople!: number;

  public currentPeople!: number;

  public applicationType!: ApplicationType;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

SubjectData.init(
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
    maxPeople: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    currentPeople: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    applicationType: {
      type: DataTypes.ENUM('ORDER', 'RANDOM'),
      allowNull: false
    }
  },
  { sequelize, modelName: 'subject_data', timestamps: true }
);

export default SubjectData;
