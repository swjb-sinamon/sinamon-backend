import { DataTypes, Model } from 'sequelize';
import sequelize from '../index';

interface AnonymousReplyAttributes {
  id?: number;
  originId: number;
  content: string;
  author: string;
}

class AnonymousReply extends Model<AnonymousReplyAttributes> {
  public id!: number;

  public originId!: number;

  public content!: string;

  public author!: string;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

AnonymousReply.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      primaryKey: true,
      autoIncrement: true
    },
    originId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false
    },
    author: {
      type: DataTypes.UUID,
      allowNull: false
    }
  },
  { sequelize, modelName: 'anonymous_reply', timestamps: true }
);

export default AnonymousReply;
