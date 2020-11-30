import { DataTypes, Model } from 'sequelize';
import sequelize from '../index';

interface UniformAttributes {
  id?: number;
  grade: number;
  fullClass: number;
  date: Date;
  score: number;
}

class Uniform extends Model<UniformAttributes> {
  public grade!: number;

  public fullClass!: number;

  public date!: Date;

  public score!: boolean;
}

Uniform.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      primaryKey: true,
      autoIncrement: true
    },
    grade: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fullClass: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  { sequelize, modelName: 'uniform', timestamps: false }
);

export default Uniform;
