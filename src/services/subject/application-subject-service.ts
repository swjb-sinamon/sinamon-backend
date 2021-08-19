import { SubjectApplicationType } from '../../types';
import AppMajorSubjects from '../../databases/models/subject/app-major-subjects';
import AppSelectSubjects from '../../databases/models/subject/app-select-subjects';
import ServiceException from '../../exceptions';
import ErrorMessage from '../../error/error-message';

interface ApplicationSubjectProps {
  readonly userId: string;
  readonly subjectId: number;
  readonly type: SubjectApplicationType;
  readonly priority: number;
}

export const applicationMajorSubject = async (
  options: ApplicationSubjectProps
): Promise<AppMajorSubjects> => {
  const current = await AppMajorSubjects.findOne({
    where: {
      ...options
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
  const current = await AppSelectSubjects.findOne({
    where: {
      ...options
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
