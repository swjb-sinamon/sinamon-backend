import { DataTypes, Model } from 'sequelize';
import sequelize from '../index';

interface PermissionsAttributes {
  uuid: string;
  isAdmin: boolean;
  isTeacher: boolean;
  isSchoolUnion: boolean;
}

class Permissions extends Model<PermissionsAttributes> {
  public uuid!: string;

  public isAdmin!: boolean;

  public isTeacher!: boolean;

  public isSchoolUnion!: boolean;
}

Permissions.init(
  {
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isTeacher: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isSchoolUnion: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  { sequelize, modelName: 'permissions', timestamps: false }
);

export default Permissions;
