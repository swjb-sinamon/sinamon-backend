import { DataTypes, Model } from 'sequelize';
import sequelize from '../../index';

interface MajorSubjectsAttributes {
  readonly id?: number;
  readonly userId: string;
  readonly subjectId: number;
}

class MajorSubjects extends Model<MajorSubjectsAttributes> {
  public id!: number;

  public userId!: string;

  public subjectId!: number;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

MajorSubjects.init(
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
  { sequelize, modelName: 'major_subjects', timestamps: true }
);

export default MajorSubjects;
