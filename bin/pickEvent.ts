// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-extraneous-dependencies
import dayjs from 'dayjs';
import Users from '../src/databases/models/users';

const TOTAL_PICK = 93;
const FIRST_CHANCE = 0.525511;
const SECOND_CHANCE = 0.474489;

function convertSchoolNumber(department: number, grade: number, clazz: number, n: number): number {
  let result = `${grade}`;

  if (department === 1 && clazz === 1) result += '01';
  if (department === 1 && clazz === 2) result += '02';
  if (department === 2 && clazz === 1) result += '03';
  if (department === 2 && clazz === 2) result += '04';
  if (department === 3 && clazz === 1) result += '05';
  if (department === 3 && clazz === 2) result += '06';
  if (department === 4 && clazz === 1) result += '07';
  if (department === 4 && clazz === 2) result += '08';
  if (department === 5 && clazz === 1) result += '09';

  const stringN = n.toString().padStart(2, '0');

  result += stringN;

  return parseInt(result, 10);
}

(async () => {
  const users = await Users.findAll();

  const date = dayjs()
    .set('month', 1)
    .set('date', 31)
    .unix();

  let pick = 0;

  let pickResult = '';

  users.forEach((u) => {
    if (pick >= TOTAL_PICK) return;

    if (u.name !== '선생님테스트' && u.name !== '학생테스트') {
      const rand = Math.random();
      const chance = parseFloat(rand.toFixed(6));

      const created = Math.floor(u.createdAt.getTime() / 1000);
      if (created <= date) {
        if (chance >= 0 && chance <= FIRST_CHANCE) {
          pickResult += `${convertSchoolNumber(u.department, u.studentGrade, u.studentClass, u.studentNumber)},`;
          pick += 1;
        }
      } else if (chance >= 0 && chance <= SECOND_CHANCE) {
        pickResult += `${convertSchoolNumber(u.department, u.studentGrade, u.studentClass, u.studentNumber)},`;
        pick += 1;
      }
    }
  });

  console.log(pickResult);
  process.exit(0);
})();
