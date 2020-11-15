import { DataTypes, Model } from 'sequelize';
import sequelize from '../index';

interface ActivationCodeAttributes {
  id?: number;
  code: string;
  isUse: boolean;
  useAt?: Date;
}

class ActivationCode extends Model<ActivationCodeAttributes> {
  public id!: number;

  public code!: string;

  public isUse!: boolean;

  public useAt!: Date;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

ActivationCode.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isUse: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    useAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  { sequelize, modelName: 'activationcode', timestamps: true }
);

export default ActivationCode;
