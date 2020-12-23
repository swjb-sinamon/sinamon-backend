import Comcigan from 'comcigan-parser-fixed';

export const getTimetableInstance = async (): Promise<Comcigan> => {
  const timetable = new Comcigan();
  await timetable.init();
  await timetable.setSchool('수원정보과학고등학교');

  return timetable;
};
