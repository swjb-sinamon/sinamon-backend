import { DataTypes, Model } from 'sequelize';
import sequelize from '../index';

interface AnonymousAttributes {
  id?: number;
  title: string;
  content: string;
}

class Anonymous extends Model<AnonymousAttributes> {
  public id!: number;

  public title!: string;

  public content!: string;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

Anonymous.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  { sequelize, modelName: 'anonymous', timestamps: true }
);

export default Anonymous;
