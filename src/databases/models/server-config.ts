import { DataTypes, Model } from 'sequelize';
import sequelize from '../index';

interface ServerConfigAttributes {
  configKey: string;
  configValue: string;
}

class ServerConfig extends Model<ServerConfigAttributes> {
  public configKey!: string;

  public configValue!: string;
}

ServerConfig.init(
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
  { sequelize, modelName: 'serverconfig', timestamps: false }
);

export default ServerConfig;
