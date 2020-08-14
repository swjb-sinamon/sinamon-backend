import { DataTypes, Model } from 'sequelize';
import sequelize from '../index';

interface SubjectsAttributes {
  id: number;
  subjectName: string;
}

class Subjects extends Model<SubjectsAttributes> {
  public id!: number;

  public subjectName!: string;
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
    subjectName: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  { sequelize, modelName: 'subjects', timestamps: false }
);

export default Subjects;
