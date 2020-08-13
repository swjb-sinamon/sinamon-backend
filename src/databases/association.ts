import Users from './models/users';
import Rentals from './models/rentals';
import Umbrellas from './models/umbrellas';
import Subjects from './models/subjects';
import OnlineTimeTables from './models/online-time-tables';

const databaseAssociation = (): void => {
  // Users, Rentals 1:1
  Users.hasOne(Rentals, { foreignKey: 'lender', sourceKey: 'uuid' });
  Rentals.belongsTo(Users, { foreignKey: 'uuid', targetKey: 'lender' });

  // Umbrellas, Rentals 1:1
  Umbrellas.hasOne(Rentals, { foreignKey: 'umbrellaName', sourceKey: 'name' });
  Rentals.belongsTo(Users, { foreignKey: 'name', targetKey: 'umbrellaName' });

  // Subjects, OnlineTimeTables 1:N
  Subjects.hasMany(OnlineTimeTables, { foreignKey: 'subjectId', sourceKey: 'id' });
  OnlineTimeTables.belongsTo(Subjects, { foreignKey: 'id', targetKey: 'subjectId' });
};

export default databaseAssociation;
