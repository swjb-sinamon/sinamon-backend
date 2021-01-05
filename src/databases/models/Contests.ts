import { DataTypes, Model } from 'sequelize';
import sequelize from '../index';

interface ContestsAttributes {
  uuid: string;
  name: string;
  role: number;
}

class Contests extends Model<ContestsAttributes> {
  public uuid!: string;

  public name!: string;

  public role!: number;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

Contests.init(
  {
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.CHAR,
      allowNull: false
    },
    role: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  { sequelize, modelName: 'contests', timestamps: true }
);

export default Contests;
