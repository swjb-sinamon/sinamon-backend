import { ApplicationType, SubjectApplicationStatus, SubjectType } from '../../types';
import AppMajorSubjects from '../../databases/models/subject/app-major-subjects';
import AppSelectSubjects from '../../databases/models/subject/app-select-subjects';
import ServiceException from '../../exceptions';
import ErrorMessage from '../../error/error-message';
import ServerConfigs from '../../databases/models/server-configs';
import Users from '../../databases/models/users';
import Subjects from '../../databases/models/subject/subjects';
import MajorSubjects from '../../databases/models/subject/major_subjects';
import SelectSubjects from '../../databases/models/subject/select-subjects';
import db from '../../databases';
import { logger } from '../../index';

interface ApplicationSubjectProps {
  readonly userId: string;
  readonly subjectId: number;
  readonly status: SubjectApplicationStatus;
  readonly priority?: number;
}

interface GetApplicationSubjectsReturn {
  readonly select: Array<AppSelectSubjects & { user: Users; subject: Subjects }>;
  readonly major: Array<AppMajorSubjects & { user: Users; subject: Subjects }>;
}

type ApplicationSubjectModel = 'major' | 'select';

export const getCanSubject = async (): Promise<boolean> => {
  const result = await ServerConfigs.findOne({
    where: {
      configKey: 'canSubject'
    }
  });

  if (!result) return false;

  return result.configValue === 'true';
};

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

export const applicationSubject = async (
  options: ApplicationSubjectProps,
  modelType: ApplicationSubjectModel
): Promise<AppMajorSubjects | AppSelectSubjects> => {
  const config = await getCanSubject();
  if (!config) throw new ServiceException(ErrorMessage.CAN_NOT_APPLICATION, 400);

  const Model = modelType === 'major' ? AppMajorSubjects : AppSelectSubjects;

  const subject = await Subjects.findOne({
    where: {
      id: options.subjectId
    }
  });

  if (!subject) throw new ServiceException(ErrorMessage.SUBJECT_NOT_FOUND, 404);

  const type = modelType === 'major' ? SubjectType.MAJOR_SUBJECT : SubjectType.SELECT_SUBJECT;
  if (subject.type !== type) {
    logger.warn(`${options.userId} 올바르지 않는 과목 종류를 신청하였습니다.`);
    throw new ServiceException(ErrorMessage.INVALID_SUBJECT, 400);
  }

  if (subject.maxPeople === subject.currentPeople) {
    throw new ServiceException(ErrorMessage.FULL_SUBJECT, 409);
  }

  if (subject.applicationType === ApplicationType.RANDOM && !options.priority) {
    // 지망 배정 과목인데 우선순위가 없을경우(선착순으로 신청했을경우)
    logger.warn(`${options.userId} 올바르지 않는 배정 방식을 선택하였습니다.`);
    throw new ServiceException(ErrorMessage.INVAILD_APPLICATION, 400);
  }

  const current = await Model.findOne({
    where: {
      subjectId: options.subjectId
    }
  });

  if (current) throw new ServiceException(ErrorMessage.APPLICATION_ALREADY_EXISTS, 409);

  const isOrder = subject.applicationType === ApplicationType.ORDER;
  if (isOrder) {
    const SuccessModel = modelType === 'major' ? MajorSubjects : SelectSubjects;
    await db.transaction(async (t) => {
      await SuccessModel.create(
        {
          userId: options.userId,
          subjectId: options.subjectId
        },
        {
          transaction: t
        }
      );
      subject.currentPeople += 1;
      await subject.save({
        transaction: t
      });
    });
    logger.info(`${options.userId} 님이 ${options.subjectId} 과목을 신청 완료했습니다.`);
  }

  const result = await Model.create({
    ...options,
    status: isOrder ? SubjectApplicationStatus.SUCCESS : SubjectApplicationStatus.WAITING
  });

  return result;
};

export const cancelSubject = async (
  applicationId: number,
  userId: string,
  modelType: ApplicationSubjectModel
): Promise<AppMajorSubjects> => {
  const Model = modelType === 'major' ? AppMajorSubjects : AppSelectSubjects;

  const data = await Model.findOne({
    where: {
      id: applicationId
    }
  });

  if (!data) throw new ServiceException(ErrorMessage.APPLICATION_NOT_FOUND, 404);
  if (data.userId !== userId) throw new ServiceException(ErrorMessage.NO_PERMISSION, 401);
  if (data.status === SubjectApplicationStatus.SUCCESS) {
    throw new ServiceException(ErrorMessage.CAN_NOT_SUBJECT_CANCEL, 400);
  }

  await data.destroy();

  return data;
};
