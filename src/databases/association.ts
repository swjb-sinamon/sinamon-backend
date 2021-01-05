import Users from './models/users';
import Rentals from './models/rentals';
import Umbrellas from './models/umbrellas';
import Permissions from './models/permissions';
import UniformPersonal from './models/uniform-personal';
import Contests from './models/Contests';

const databaseAssociation = (): void => {
  // Users, Rentals 1:1
  Users.hasOne(Rentals, { foreignKey: 'lender' });
  Rentals.belongsTo(Users, { foreignKey: 'lender' });

  // Users, Permissions 1:1
  Users.hasOne(Permissions, { foreignKey: 'uuid' });
  Permissions.belongsTo(Users, { foreignKey: 'uuid' });

  // Umbrellas, Rentals 1:1
  Umbrellas.hasOne(Rentals, { foreignKey: 'umbrellaName' });
  Rentals.belongsTo(Users, { foreignKey: 'umbrellaName' });

  // Users, UniformPersonal 1:1
  Users.hasOne(UniformPersonal, { foreignKey: 'uuid' });
  UniformPersonal.belongsTo(Users, { foreignKey: 'uuid' });

  // Users, Contests 1:1
  Users.hasOne(Contests, { foreignKey: 'uuid' });
  Contests.belongsTo(Users, { foreignKey: 'uuid' });
};

export default databaseAssociation;
