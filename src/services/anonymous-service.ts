import Anonymous from '../databases/models/anonymous';
import AnonymousReply from '../databases/models/anonymous-reply';
import { UserWithPermissions } from '../types';
import Users from '../databases/models/users';
import ServiceException from '../exceptions';
import ErrorMessage from '../error/error-message';
import { getUser } from './auth-service';
import { PaginationResult } from '../types/pagination-result';

type ReplyWithAuthor = AnonymousReply & { user: UserWithPermissions };
type AnonymousResult = Anonymous & { reply: ReplyWithAuthor };

const userIncludeOptions = {
  include: [
    {
      model: Users,
      as: 'user',
      attributes: {
        exclude: ['password']
      }
    }
  ] as never
};
const includeOptions = {
  include: [
    {
      model: AnonymousReply,
      as: 'reply',
      ...userIncludeOptions
    }
  ] as never
};

export const getAllAnonymous = async (): Promise<PaginationResult<AnonymousResult[]>> => {
  const { rows, count } = await Anonymous.findAndCountAll({
    ...includeOptions
  });

  return {
    count,
    data: rows as AnonymousResult[]
  };
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

export const getAnonymousReply = async (id: number): Promise<ReplyWithAuthor> => {
  const result = await AnonymousReply.findOne({
    where: {
      id
    },
    ...userIncludeOptions
  });

  if (!result) throw new ServiceException(ErrorMessage.ANONYMOUS_REPLY_NOT_FOUND, 404);

  return result as ReplyWithAuthor;
};

export const createAnonymousReply = async (
  originId: number,
  content: string,
  author: string
): Promise<ReplyWithAuthor> => {
  const user = await getUser(author);
  const currentAnonymous = await getAnonymous(originId);

  const result = await AnonymousReply.create({
    originId: currentAnonymous.id,
    content,
    author: user.uuid
  });

  return result as ReplyWithAuthor;
};

export const updateAnonymousReply = async (
  id: number,
  content: string,
  executor: string
): Promise<ReplyWithAuthor> => {
  const current = await getAnonymousReply(id);

  if (current.user.uuid !== executor)
    throw new ServiceException(ErrorMessage.ANONYMOUS_CANNOT_UPDATE, 401);

  await current.update({
    content
  });

  return current;
};

export const deleteAnonymousReply = async (
  id: number,
  executor: string
): Promise<ReplyWithAuthor> => {
  const current = await getAnonymousReply(id);

  if (current.user.uuid !== executor)
    throw new ServiceException(ErrorMessage.ANONYMOUS_CANNOT_DELETE, 401);

  await current.destroy();

  return current;
};
