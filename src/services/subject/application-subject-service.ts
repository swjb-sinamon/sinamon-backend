import { SubjectApplicationStatus, SubjectType } from '../../types';
import AppMajorSubjects from '../../databases/models/subject/app-major-subjects';
import AppSelectSubjects from '../../databases/models/subject/app-select-subjects';
import ServiceException from '../../exceptions';
import ErrorMessage from '../../error/error-message';
import ServerConfigs from '../../databases/models/server-configs';
import Users from '../../databases/models/users';
import Subjects from '../../databases/models/subject/subjects';

interface ApplicationSubjectProps {
  readonly userId: string;
  readonly subjectId: number;
  readonly status: SubjectApplicationStatus;
  readonly priority?: number;
}

export const setCanSubject = async (status: boolean): Promise<void> => {
  await ServerConfigs.update(
    {
      configValue: `${status}`
    },
    {
      where: {
        configKey: 'canSubject'
      }
    }
  );
};

interface GetApplicationSubjectsReturn {
  readonly select: Array<AppSelectSubjects & { user: Users; subject: Subjects }>;
  readonly major: Array<AppMajorSubjects & { user: Users; subject: Subjects }>;
}
export const getApplicationSubjects = async (
  userId: string
): Promise<GetApplicationSubjectsReturn> => {
  const select = await AppSelectSubjects.findAll({
    where: {
      userId
    },
    include: [
      {
        model: Users,
        as: 'user',
        attributes: ['id', 'name', 'department', 'studentGrade', 'studentClass', 'studentNumber']
      },
      {
        model: Subjects,
        as: 'subject'
      }
    ] as never
  });

  const major = await AppMajorSubjects.findAll({
    where: {
      userId
    },
    include: [
      {
        model: Users,
        as: 'user',
        attributes: ['id', 'name', 'department', 'studentGrade', 'studentClass', 'studentNumber']
      },
      {
        model: Subjects,
        as: 'subject'
      }
    ] as never
  });

  return {
    select: select as Array<AppSelectSubjects & { user: Users; subject: Subjects }>,
    major: major as Array<AppMajorSubjects & { user: Users; subject: Subjects }>
  };
};

export const applicationMajorSubject = async (
  options: ApplicationSubjectProps
): Promise<AppMajorSubjects> => {
  const subject = await Subjects.findOne({
    where: {
      id: options.subjectId
    }
  });

  if (subject && subject.type !== SubjectType.MAJOR_SUBJECT) {
    throw new ServiceException(ErrorMessage.INVALID_SUBJECT, 400);
  }

  const current = await AppMajorSubjects.findOne({
    where: {
      subjectId: options.subjectId
    }
  });

  if (current)
    throw new ServiceException(ErrorMessage.APPLICATION_MAJOR_SUBJECT_ALREADY_EXISTS, 409);

  const result = await AppMajorSubjects.create({
    ...options
  });

  return result;
};

export const applicationSelectSubject = async (
  options: ApplicationSubjectProps
): Promise<AppSelectSubjects> => {
  const subject = await Subjects.findOne({
    where: {
      id: options.subjectId
    }
  });

  if (subject && subject.type !== SubjectType.SELECT_SUBJECT) {
    throw new ServiceException(ErrorMessage.INVALID_SUBJECT, 400);
  }

  const current = await AppSelectSubjects.findOne({
    where: {
      subjectId: options.subjectId
    }
  });

  if (current)
    throw new ServiceException(ErrorMessage.APPLICATION_SELECT_SUBJECT_ALREADY_EXISTS, 409);

  const result = await AppSelectSubjects.create({
    ...options
  });

  return result;
};

export const cancelMajorSubject = async (applicationId: number): Promise<AppMajorSubjects> => {
  const data = await AppMajorSubjects.findOne({
    where: {
      id: applicationId
    }
  });

  if (!data) throw new ServiceException(ErrorMessage.APPLICATION_MAJOR_NOT_FOUND, 404);

  await data.destroy();

  return data;
};

export const cancelSelectSubject = async (applicationId: number): Promise<AppSelectSubjects> => {
  const data = await AppSelectSubjects.findOne({
    where: {
      id: applicationId
    }
  });

  if (!data) throw new ServiceException(ErrorMessage.APPLICATION_SELECT_NOT_FOUND, 404);

  await data.destroy();

  return data;
};
