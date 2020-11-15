import { DataTypes, Model } from 'sequelize';
import sequelize from '../index';

interface RentalsAttributes {
  uuid: string;
  lender: string;
  umbrellaName: string;
  expiryDate: Date;
  isExpire: boolean;
}

class Rentals extends Model<RentalsAttributes> {
  public uuid!: string;

  public lender!: string;

  public umbrellaName!: string;

  public expiryDate!: Date;

  public isExpire!: boolean;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

Rentals.init(
  {
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    lender: {
      type: DataTypes.UUID,
      allowNull: false
    },
    umbrellaName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    isExpire: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  },
  { sequelize, modelName: 'rentals', timestamps: true, paranoid: true }
);

export default Rentals;
