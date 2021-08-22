import { DataTypes, Model } from 'sequelize';
import sequelize from '../../index';
import { SubjectApplicationStatus } from '../../../types';

interface AppSelectSubjectsAttributes {
  readonly id?: number;
  readonly userId: string;
  readonly subjectId: number;
  readonly status: SubjectApplicationStatus;
  readonly priority?: number;
}

class AppSelectSubjects extends Model<AppSelectSubjectsAttributes> {
  public id!: number;

  public userId!: string;

  public subjectId!: number;

  public status!: SubjectApplicationStatus;

  public priority?: number;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;

  public readonly deletedAt?: Date;
}

AppSelectSubjects.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    subjectId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('SUCCESS', 'WAITING', 'NONE'),
      defaultValue: 'WAITING',
      allowNull: false
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  { sequelize, modelName: 'app_select_subjects', timestamps: true, paranoid: true }
);

export default AppSelectSubjects;
