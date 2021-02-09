import Comcigan from 'comcigan-parser';

const HOST = 'http://comci.kr:4082';

export const getTimetableInstance = async (): Promise<Comcigan> => {
  const timetable = new Comcigan();

  /* eslint-disable no-underscore-dangle */
  timetable._baseUrl = HOST;
  timetable._url = `${HOST}/st`;

  await timetable.init();
  await timetable.setSchool('수원정보과학고등학교');

  return timetable;
};
