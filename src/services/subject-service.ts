import Subjects from '../databases/models/subjects';

export const getSubjects = async (): Promise<Subjects[]> => {
  const result = await Subjects.findAll();
  return result;
};

export const getSubject = async (id: number): Promise<Subjects | undefined> => {
  const result = await Subjects.findOne({
    where: {
      id
    }
  });

  if (!result) {
    return undefined;
  }

  return result;
};

export const createSubject = async (subjectName: string): Promise<Subjects | undefined> => {
  const current = await Subjects.findOne({
    where: {
      subjectName
    }
  });

  if (current) {
    return undefined;
  }

  const result = await Subjects.create({
    subjectName
  });

  return result;
};

export const updateSubject = async (id: number, subjectName: string):
  Promise<Subjects | undefined> => {
  const current = await Subjects.findOne({
    where: {
      id
    }
  });

  if (!current) {
    return undefined;
  }

  await current.update({
    subjectName
  });

  return current;
};

export const removeSubject = async (id: number): Promise<Subjects | undefined> => {
  const current = await Subjects.findOne({
    where: {
      id
    }
  });

  if (!current) {
    return undefined;
  }

  await current.destroy();

  return current;
};
