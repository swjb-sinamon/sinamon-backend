import { DataTypes, Model } from 'sequelize';
import sequelize from '../index';

interface ServerConfigAttributes {
  configKey: string;
  configValue: string;
}

class ServerConfigs extends Model<ServerConfigAttributes> {
  public configKey!: string;

  public configValue!: string;
}

ServerConfigs.init(
  {
    configKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    configValue: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  { sequelize, modelName: 'serverconfigs', timestamps: false }
);

export default ServerConfigs;
