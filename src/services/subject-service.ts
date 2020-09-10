import Subjects from '../databases/models/subjects';
import ServiceException from '../exceptions';
import ErrorMessage from '../error/error-message';

export const getSubjects = async (): Promise<Subjects[]> => {
  const result = await Subjects.findAll();
  return result;
};

export const getSubject = async (id: number): Promise<Subjects> => {
  const result = await Subjects.findOne({
    where: {
      id
    }
  });

  if (!result) throw new ServiceException(ErrorMessage.SUBJECT_NOT_FOUND, 404);

  return result;
};

export const createSubject = async (subjectName: string): Promise<Subjects> => {
  const current = await Subjects.findOne({
    where: {
      subjectName
    }
  });

  if (current) throw new ServiceException(ErrorMessage.SUBJECT_ALREADY_EXISTS, 409);

  const result = await Subjects.create({
    subjectName
  });

  return result;
};

export const updateSubject = async (id: number, subjectName: string): Promise<Subjects> => {
  const current = await Subjects.findOne({
    where: {
      id
    }
  });

  if (!current) throw new ServiceException(ErrorMessage.SUBJECT_NOT_FOUND, 404);

  await current.update({
    subjectName
  });

  return current;
};

export const removeSubject = async (id: number): Promise<Subjects> => {
  const current = await Subjects.findOne({
    where: {
      id
    }
  });

  if (!current) throw new ServiceException(ErrorMessage.SUBJECT_NOT_FOUND, 404);

  await current.destroy();

  return current;
};
