import { chromium } from 'playwright';
import { logger } from '..';

const HOST = 'http://112.186.146.81:4082/st';
const ORIGIN_DATA_LABEL = 'hour';
const SCHOOL_NAME = '수원정보과학고등학교';
const SCHOOL_ID = '97812';

const TIMETABLE_REGEX = /일일자료=자료\.자료\d{3}/g;
const TEACHER_REGEX = /성명=자료\.자료\d{3}/g;
const SUBJECT_REGEX = /"<td class='"\+속성\+"'>"\+자료\.자료\d{3}/g;

let timetableIndex = '';
let subjectIndex = '';
let teacherIndex = '';

interface TimetableData {
  readonly subject: string;
  readonly teacher: string;
}

type DayTimetable<T = TimetableData> = T[];
type WeekTimetable<T = TimetableData> = DayTimetable<T>[];
type ClassTimetable<T = TimetableData> = WeekTimetable<T>[];
type GradeTimetable<T = TimetableData> = ClassTimetable<T>[];

class TimetableParser {
  private data: GradeTimetable = [];

  private subjectData: string[] = [];

  private teacherData: string[] = [];

  private ready = false;

  private timeout = (t: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => resolve(), t);
      } catch (e) {
        reject(e);
      }
    });
  };

  public async fetchTimetable(): Promise<void> {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(HOST);

    await page.evaluate(`window.localStorage.setItem('scnm','${SCHOOL_NAME}');`);
    await page.evaluate(`window.localStorage.setItem('sc','${SCHOOL_ID}');`);
    await page.evaluate("window.localStorage.setItem('r', '1');");
    await page.evaluate("window.localStorage.setItem('r2','0');");
    await page.evaluate("window.localStorage.setItem('Tsc','');");

    await page.reload();

    await this.timeout(100);

    const dataStr: string = await page.evaluate(
      `window.localStorage.getItem('${ORIGIN_DATA_LABEL}');`
    );
    const parsingData = JSON.parse(dataStr);

    const handle = await page.$('//html/head/script[2]');
    const script = handle && (await handle.innerHTML());
    const timetableSource = script && script.match(TIMETABLE_REGEX);
    const subjectSource = script && script.match(SUBJECT_REGEX);
    const teacherSource = script && script.match(TEACHER_REGEX);

    timetableIndex = (timetableSource && timetableSource[0].slice(-3)) || '';
    subjectIndex = (subjectSource && subjectSource[0].slice(-3)) || '';
    teacherIndex = (teacherSource && teacherSource[0].slice(-3)) || '';

    await browser.close();

    this.subjectData = parsingData[`긴자료${subjectIndex}`];
    this.teacherData = parsingData[`자료${teacherIndex}`];

    this.data = (parsingData[`자료${timetableIndex}`] as GradeTimetable<string>).map(
      (clazz: ClassTimetable<string>) => {
        return clazz.map((week: WeekTimetable<string>) => {
          week.splice(0, 1);
          return week.map((day: DayTimetable<string>) => {
            day.splice(0, 1);
            return day.map((p: string) => {
              const period = p.toString();

              if (period === '0') {
                return {
                  subject: '',
                  teacher: ''
                };
              }

              const subjectCode = parseInt(period.slice(-2), 10);
              const teacherCode = parseInt(
                period.length === 4 ? period.slice(0, 2) : period.slice(0, 1),
                10
              );

              return {
                subject: this.subjectData[subjectCode],
                teacher: period.length === 7 ? '' : this.teacherData[teacherCode]
              };
            });
          });
        });
      }
    );

    this.ready = true;
  }

  public getTimetable(grade: number, clazz: number): WeekTimetable {
    if (!this.ready) throw new Error('Please execute fetchTimetable() function first.');
    return this.data[grade][clazz];
  }

  public getData(): GradeTimetable {
    if (!this.ready) throw new Error('Please execute fetchTimetable() function first.');
    return this.data;
  }
}

export default new TimetableParser();
