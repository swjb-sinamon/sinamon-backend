import { DataTypes, Model } from 'sequelize';
import sequelize from '../index';

interface UmbrellasAttributes {
  name: string;
  status: string;
}

class Umbrellas extends Model<UmbrellasAttributes> {
  public name!: string;

  public status!: string;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

Umbrellas.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    status: {
      type: DataTypes.CHAR,
      allowNull: false
    }
  },
  { sequelize, modelName: 'umbrellas', timestamps: true }
);

export default Umbrellas;
