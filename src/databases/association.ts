import Users from './models/users';
import Rentals from './models/rentals';
import Umbrellas from './models/umbrellas';
import Subjects from './models/subjects';
import OnlineTimeTables from './models/online-time-tables';

const databaseAssociation = (): void => {
  // Users, Rentals 1:1
  Users.hasOne(Rentals, { foreignKey: 'lender' });
  Rentals.belongsTo(Users, { foreignKey: 'uuid' });

  // Umbrellas, Rentals 1:1
  Umbrellas.hasOne(Rentals, { foreignKey: 'umbrellaName' });
  Rentals.belongsTo(Users, { foreignKey: 'name' });

  // Subjects, OnlineTimeTables 1:N
  Subjects.hasMany(OnlineTimeTables, { foreignKey: 'subjectId' });
  OnlineTimeTables.belongsTo(Subjects, { foreignKey: 'id' });
};

export default databaseAssociation;
