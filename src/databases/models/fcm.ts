import { DataTypes, Model } from 'sequelize';
import sequelize from '../index';

interface FCMAttributes {
  uuid: string;
  token: string;
}

class FCM extends Model<FCMAttributes> {
  public uuid!: string;

  public token!: string;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

FCM.init(
  {
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  { sequelize, modelName: 'fcm', timestamps: true }
);

export default FCM;
