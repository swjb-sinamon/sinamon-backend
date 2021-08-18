import { DataTypes, Model } from 'sequelize';
import sequelize from '../../index';
import { SubjectApplicationType } from '../../../types';

interface AppMajorSubjectsAttributes {
  readonly id?: number;
  readonly userId: string;
  readonly subjectId: number;
  readonly type: SubjectApplicationType;
  readonly priority: number;
}

class AppMajorSubjects extends Model<AppMajorSubjectsAttributes> {
  public id!: number;

  public userId!: string;

  public subjectId!: number;

  public type!: SubjectApplicationType;

  public priority?: number;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

AppMajorSubjects.init(
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
    type: {
      type: DataTypes.ENUM('WAITING', 'FAIL'),
      defaultValue: 'WAITING',
      allowNull: false
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  { sequelize, modelName: 'app_major_subjects', timestamps: true }
);

export default AppMajorSubjects;
