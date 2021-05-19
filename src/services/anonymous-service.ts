import Anonymous from '../databases/models/anonymous';
import AnonymousReply from '../databases/models/anonymous-reply';
import { UserWithPermissions } from '../types';
import Users from '../databases/models/users';
import ServiceException from '../exceptions';
import ErrorMessage from '../error/error-message';
import { getUser } from './auth-service';

type ReplyWithAuthor = AnonymousReply & { user: UserWithPermissions };
type AnonymousResult = Anonymous & { reply: ReplyWithAuthor };

const includeOptions = {
  include: [
    {
      model: AnonymousReply,
      as: 'reply',
      include: [
        {
          model: Users,
          as: 'user'
        }
      ]
    }
  ] as never
};

export const getAllAnonymous = async (): Promise<AnonymousResult[]> => {
  const result = await Anonymous.findAll({
    ...includeOptions
  });

  return result as AnonymousResult[];
};

export const getAnonymous = async (id: number): Promise<AnonymousResult> => {
  const result = await Anonymous.findOne({
    where: {
      id
    },
    ...includeOptions
  });

  if (!result) throw new ServiceException(ErrorMessage.ANONYMOUS_NOT_FOUND, 404);

  return result as AnonymousResult;
};

export const createAnonymous = async (title: string, content: string): Promise<AnonymousResult> => {
  const result = await Anonymous.create(
    {
      title,
      content
    },
    {
      ...includeOptions
    }
  );
  return result as AnonymousResult;
};

export const createAnonymousReply = async (
  originId: number,
  content: string,
  author: string
): Promise<AnonymousReply> => {
  const user = await getUser(author);
  const currentAnonymous = await getAnonymous(originId);

  const result = await AnonymousReply.create({
    originId: currentAnonymous.id,
    content,
    author: user.uuid
  });

  return result;
};

export const updateAnonymousReply = async (
  id: number,
  content: string
): Promise<AnonymousReply> => {
  const current = await AnonymousReply.findOne({
    where: {
      id
    },
    include: [
      {
        model: Users,
        as: 'user'
      }
    ] as never
  });

  if (!current) throw new ServiceException(ErrorMessage.ANONYMOUS_REPLY_NOT_FOUND, 404);

  await current.update({
    content
  });

  return current;
};

export const deleteAnonymousReply = async (id: number): Promise<AnonymousReply> => {
  const current = await AnonymousReply.findOne({
    where: {
      id
    },
    include: [
      {
        model: Users,
        as: 'user'
      }
    ] as never
  });

  if (!current) throw new ServiceException(ErrorMessage.ANONYMOUS_REPLY_NOT_FOUND, 404);

  await current.destroy();

  return current;
};
