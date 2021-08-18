import { DataTypes, Model } from 'sequelize';
import sequelize from '../../index';

interface SelectSubjectsAttributes {
  readonly id?: number;
  readonly userId: string;
  readonly subjectId: number;
}

class SelectSubjects extends Model<SelectSubjectsAttributes> {
  public id!: number;

  public userId!: string;

  public subjectId!: number;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

SelectSubjects.init(
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
    }
  },
  { sequelize, modelName: 'select_subjects', timestamps: true }
);

export default SelectSubjects;
