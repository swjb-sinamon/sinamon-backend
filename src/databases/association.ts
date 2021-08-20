import Users from './models/users';
import Rentals from './models/rentals';
import Umbrellas from './models/umbrellas';
import Permissions from './models/permissions';
import AnonymousReply from './models/anonymous-reply';
import Anonymous from './models/anonymous';
import Subjects from './models/subject/subjects';
import AppMajorSubjects from './models/subject/app-major-subjects';
import AppSelectSubjects from './models/subject/app-select-subjects';
import MajorSubjects from './models/subject/major_subjects';
import SelectSubjects from './models/subject/select-subjects';

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

  // Anonymous, AnonymousReply 1:N
  Anonymous.hasMany(AnonymousReply, { foreignKey: 'originId', as: 'reply' });
  AnonymousReply.belongsTo(Anonymous, { foreignKey: 'originId' });

  // Users, AnonymousReply 1:N
  Users.hasMany(AnonymousReply, { foreignKey: 'author' });
  AnonymousReply.belongsTo(Users, { foreignKey: 'author' });

  // Subjects, AppMajorSubjects 1:N
  Subjects.hasMany(AppMajorSubjects, { foreignKey: 'subjectId' });
  AppMajorSubjects.belongsTo(Subjects, { foreignKey: 'subjectId' });

  // Subjects, AppSelectSubjects 1:N
  Subjects.hasMany(AppSelectSubjects, { foreignKey: 'subjectId' });
  AppSelectSubjects.belongsTo(Subjects, { foreignKey: 'subjectId' });

  // Subjects, MajorSubjects 1:N
  Subjects.hasMany(MajorSubjects, { foreignKey: 'subjectId' });
  MajorSubjects.belongsTo(Subjects, { foreignKey: 'subjectId' });

  // Subjects, SelectSubjects 1:N
  Subjects.hasMany(SelectSubjects, { foreignKey: 'subjectId' });
  SelectSubjects.belongsTo(Subjects, { foreignKey: 'subjectId' });

  // Users, AppMajorSubjects 1:N
  Users.hasMany(AppMajorSubjects, { foreignKey: 'userId' });
  AppMajorSubjects.belongsTo(Users, { foreignKey: 'userId' });

  // Users, AppSelectSubjects 1:N
  Users.hasMany(AppSelectSubjects, { foreignKey: 'userId' });
  AppSelectSubjects.belongsTo(Users, { foreignKey: 'userId' });

  // Users, MajorSubjects 1:1
  Users.hasOne(MajorSubjects, { foreignKey: 'userId' });
  MajorSubjects.belongsTo(Users, { foreignKey: 'userId' });

  // Users, SelectSubjects 1:1
  Users.hasOne(SelectSubjects, { foreignKey: 'userId' });
  SelectSubjects.belongsTo(Users, { foreignKey: 'userId' });
};

export default databaseAssociation;
