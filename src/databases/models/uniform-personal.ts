import { DataTypes, Model } from 'sequelize';
import sequelize from '../index';

interface UniformPersonalAttributes {
  id?: number;
  uuid: string;
  date: Date;
  score: number;
}

class UniformPersonal extends Model<UniformPersonalAttributes> {
  public uuid!: string;

  public date!: Date;

  public score!: number;
}

UniformPersonal.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      primaryKey: true,
      autoIncrement: true
    },
    uuid: {
      type: DataTypes.UUID,
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
  { sequelize, modelName: 'uniformpersonal', timestamps: false }
);

export default UniformPersonal;
