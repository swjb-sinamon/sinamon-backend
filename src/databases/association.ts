import Users from './models/users';
import Rentals from './models/rentals';
import Umbrellas from './models/umbrellas';
import Permissions from './models/permissions';
import FCM from './models/fcm';
import AnonymousReply from './models/anonymous-reply';
import Anonymous from './models/anonymous';

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

  // Users, FCM 1:1
  Users.hasOne(FCM, { foreignKey: 'uuid' });
  FCM.belongsTo(Users, { foreignKey: 'uuid' });

  // Anonymous, AnonymousReply 1:N
  Anonymous.hasMany(AnonymousReply, { foreignKey: 'originId', as: 'reply' });
  AnonymousReply.belongsTo(Anonymous, { foreignKey: 'originId' });

  // Users, AnonymousReply 1:N
  Users.hasMany(AnonymousReply, { foreignKey: 'author' });
  AnonymousReply.belongsTo(Users, { foreignKey: 'author' });
};

export default databaseAssociation;
