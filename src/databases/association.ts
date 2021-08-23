import Users from './models/users';
import Rentals from './models/rentals';
import Umbrellas from './models/umbrellas';
import Permissions from './models/permissions';
import AnonymousReply from './models/anonymous-reply';
import Anonymous from './models/anonymous';
import Subjects from './models/subject/subjects';
import SubjectData from './models/subject/subject-data';
import ApplicationSubjects from './models/subject/application-subjects';
import SuccessSubjects from './models/subject/success_subjects';

const databaseAssociation = (): void => {
  Users.hasOne(Rentals, { foreignKey: 'lender' });
  Rentals.belongsTo(Users, { foreignKey: 'lender' });

  Users.hasOne(Permissions, { foreignKey: 'uuid' });
  Permissions.belongsTo(Users, { foreignKey: 'uuid' });

  Umbrellas.hasOne(Rentals, { foreignKey: 'umbrellaName' });
  Rentals.belongsTo(Users, { foreignKey: 'umbrellaName' });

  Anonymous.hasMany(AnonymousReply, { foreignKey: 'originId', as: 'reply' });
  AnonymousReply.belongsTo(Anonymous, { foreignKey: 'originId' });

  Users.hasMany(AnonymousReply, { foreignKey: 'author' });
  AnonymousReply.belongsTo(Users, { foreignKey: 'author' });

  Subjects.hasOne(SubjectData, { foreignKey: 'subjectId', as: 'subjectData' });
  SubjectData.belongsTo(Subjects, { foreignKey: 'subjectId' });

  Subjects.hasMany(ApplicationSubjects, { foreignKey: 'subjectId' });
  ApplicationSubjects.belongsTo(Subjects, { foreignKey: 'subjectId' });

  Users.hasMany(ApplicationSubjects, { foreignKey: 'userId' });
  ApplicationSubjects.belongsTo(Users, { foreignKey: 'userId' });

  Subjects.hasMany(SuccessSubjects, { foreignKey: 'subjectId' });
  SuccessSubjects.belongsTo(Subjects, { foreignKey: 'subjectId' });

  Users.hasMany(SuccessSubjects, { foreignKey: 'userId' });
  SuccessSubjects.belongsTo(Users, { foreignKey: 'userId' });
};

export default databaseAssociation;
