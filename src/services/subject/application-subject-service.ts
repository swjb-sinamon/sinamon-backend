import { Op } from 'sequelize';
import { ApplicationType, SubjectApplicationStatus } from '../../types';
import ServiceException from '../../exceptions';
import ErrorMessage from '../../error/error-message';
import ServerConfigs from '../../databases/models/server-configs';
import Users from '../../databases/models/users';
import Subjects from '../../databases/models/subject/subjects';
import db from '../../databases';
import { logger } from '../../index';
import ApplicationSubjects from '../../databases/models/subject/application-subjects';
import SubjectData from '../../databases/models/subject/subject-data';
import SuccessSubjects from '../../databases/models/subject/success_subjects';
import { PaginationResult } from '../../types/pagination-result';
import { pagination } from '../../utils/router-util';

interface ApplicationSubjectProps {
  readonly userId: string;
  readonly subjectId: number;
  readonly status: SubjectApplicationStatus;
  readonly priority?: number;
}

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

type ApplicationAndUserAndSubject = ApplicationSubjects & {
  user: Users;
  subject: Subjects & { subjectData: SubjectData };
};
export const getApplicationSubjectsByUserId = async (
  userId: string
): Promise<ApplicationAndUserAndSubject[]> => {
  const result = await ApplicationSubjects.findAll({
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
        as: 'subject',
        include: [
          {
            model: SubjectData,
            as: 'subjectData'
          }
        ]
      }
    ] as never
  });

  return result as ApplicationAndUserAndSubject[];
};

export const getApplicationSubjects = async (
  page = 0,
  limit = 10
): Promise<PaginationResult<ApplicationAndUserAndSubject[]>> => {
  const paginationOption = pagination(page, limit);
  const { rows, count } = await ApplicationSubjects.findAndCountAll({
    ...paginationOption,
    include: [
      {
        model: Users,
        as: 'user',
        attributes: ['id', 'name', 'department', 'studentGrade', 'studentClass', 'studentNumber']
      },
      {
        model: Subjects,
        as: 'subject',
        include: [
          {
            model: SubjectData,
            as: 'subjectData'
          }
        ]
      }
    ] as never
  });

  return {
    data: rows as ApplicationAndUserAndSubject[],
    count
  };
};

export const applicationSubject = async (
  options: ApplicationSubjectProps
): Promise<ApplicationSubjects> => {
  const config = await getCanSubject();
  if (!config) throw new ServiceException(ErrorMessage.CAN_NOT_APPLICATION, 400);

  const originSubject = await Subjects.findOne({
    where: {
      id: options.subjectId
    },
    include: {
      model: SubjectData,
      as: 'subjectData'
    } as never
  });
  if (!originSubject) throw new ServiceException(ErrorMessage.SUBJECT_NOT_FOUND, 404);

  const subject = originSubject as Subjects & { subjectData: SubjectData };

  if (subject.subjectData.maxPeople === subject.subjectData.currentPeople) {
    throw new ServiceException(ErrorMessage.FULL_SUBJECT, 409);
  }

  if (subject.subjectData.applicationType === ApplicationType.RANDOM && !options.priority) {
    logger.warn(`${options.userId} 올바르지 않는 배정 방식을 선택하였습니다.`);
    throw new ServiceException(ErrorMessage.INVAILD_APPLICATION, 400);
  }

  const currentApplication = await ApplicationSubjects.findOne({
    where: {
      subjectId: options.subjectId
    }
  });

  if (currentApplication) throw new ServiceException(ErrorMessage.APPLICATION_ALREADY_EXISTS, 409);

  const isOrder = subject.subjectData.applicationType === ApplicationType.ORDER;
  if (isOrder) {
    await db.transaction(async (t) => {
      await SuccessSubjects.create(
        {
          userId: options.userId,
          subjectId: options.subjectId
        },
        {
          transaction: t
        }
      );
      await SubjectData.increment(
        {
          currentPeople: 1
        },
        {
          where: {
            subjectId: options.subjectId
          },
          transaction: t
        }
      );
    });

    logger.info(`${options.userId} 님이 ${options.subjectId} 과목을 신청 완료했습니다.`);
  }

  const result = await ApplicationSubjects.create({
    ...options,
    status: isOrder ? SubjectApplicationStatus.SUCCESS : SubjectApplicationStatus.WAITING
  });

  return result;
};

export const cancelSubject = async (
  applicationId: number,
  userId: string
): Promise<ApplicationSubjects> => {
  const currentApplication = await ApplicationSubjects.findOne({
    where: {
      id: applicationId
    }
  });

  if (!currentApplication) throw new ServiceException(ErrorMessage.APPLICATION_NOT_FOUND, 404);
  if (currentApplication.userId !== userId)
    throw new ServiceException(ErrorMessage.NO_PERMISSION, 401);
  if (currentApplication.status === SubjectApplicationStatus.SUCCESS) {
    throw new ServiceException(ErrorMessage.CAN_NOT_SUBJECT_CANCEL, 400);
  }

  await currentApplication.destroy();

  return currentApplication;
};

const makeApplicationSuccess = async (
  id: number,
  subjectId: number,
  userId: string,
  priority: number
): Promise<void> => {
  await db.transaction(async (t) => {
    await ApplicationSubjects.update(
      {
        status: SubjectApplicationStatus.NONE
      },
      {
        where: {
          userId
        },
        transaction: t
      }
    );
    await ApplicationSubjects.update(
      {
        status: SubjectApplicationStatus.SUCCESS
      },
      {
        where: {
          [Op.and]: {
            id,
            priority
          }
        },
        transaction: t
      }
    );

    await SuccessSubjects.create(
      {
        userId,
        subjectId
      },
      { transaction: t }
    );
  });
};

/* eslint-disable no-restricted-syntax, no-await-in-loop */

/**
 * 랜덤방식의 과목에 수강신청한 학생들을 뽑습니다.
 * @param subjectId 랜덤 배정을 시작할 과목 ID
 * @param depth 지망 시도 횟수 (ex. 3 = 해당 과목의 3지망 학생들까지 추첨)
 */
export const pickApplication = async (subjectId: number, depth?: number): Promise<void> => {
  const originSubject = await Subjects.findOne({
    where: { id: subjectId },
    include: {
      model: SubjectData,
      as: 'subjectData'
    } as never
  });
  if (!originSubject) throw new ServiceException(ErrorMessage.SUBJECT_NOT_FOUND, 404);
  const subject = originSubject as Subjects & { subjectData: SubjectData };

  if (subject.subjectData.maxPeople - subject.subjectData.currentPeople <= 0) {
    throw new ServiceException(ErrorMessage.FULL_SUBJECT, 409);
  }

  const applications = await ApplicationSubjects.findAll({
    where: {
      subjectId,
      priority: {
        [Op.ne]: null
      }
    }
  });
  const isWaitingAndPriority = (app: ApplicationSubjects, i: number) =>
    app.status === SubjectApplicationStatus.WAITING && app.priority === i + 1;

  let currentPeople = Number(subject.subjectData.currentPeople);

  for await (const i of Array.from({ length: depth ?? 3 }).keys()) {
    if (currentPeople >= subject.subjectData.maxPeople) {
      continue;
    }

    let currentRangeApplications = applications.filter((v) => isWaitingAndPriority(v, i));
    if (currentRangeApplications.length <= 0) {
      continue;
    }

    if (subject.subjectData.maxPeople - currentRangeApplications.length <= currentPeople) {
      for await (const app of currentRangeApplications) {
        if (app.priority) {
          await makeApplicationSuccess(app.id, app.subjectId, app.userId, app.priority);
        }
      }

      currentPeople += currentRangeApplications.length;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const _ of Array.from({
        length: subject.subjectData.maxPeople - currentPeople
      })) {
        const rand = Math.floor(Math.random() * currentRangeApplications.length);
        const app = currentRangeApplications[rand];

        if (app && app.priority && app.status === SubjectApplicationStatus.WAITING) {
          await makeApplicationSuccess(app.id, app.subjectId, app.userId, app.priority);
          currentPeople++;
        }

        currentRangeApplications = applications.filter((v) => isWaitingAndPriority(v, i));
        // 중복 뽑기를 방지하기 위해, 당첨자는 제외한다.
      }
    }
  }

  await SubjectData.update(
    {
      currentPeople
    },
    {
      where: {
        subjectId
      }
    }
  );
};

/* eslint-enable no-restricted-syntax, no-await-in-loop */
