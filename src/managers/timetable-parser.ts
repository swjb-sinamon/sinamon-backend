import { chromium } from 'playwright';

const HOST = 'http://112.186.146.81:4082/st';
const ORIGIN_DATA_LABEL = 'hour';
const SCHOOL_NAME = '수원정보과학고등학교';
const SCHOOL_ID = '97812';

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
    const data = JSON.parse(dataStr);

    await browser.close();

    this.subjectData = data.긴자료618;
    this.teacherData = data.자료384;

    this.data = (data.자료135 as GradeTimetable<string>).map((clazz: ClassTimetable<string>) => {
      return clazz.map((week: WeekTimetable<string>) => {
        return week.map((day: DayTimetable<string>) => {
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
    });

    this.ready = true;
  }

  public getTimetable(grade: number, clazz: number, week: number): DayTimetable {
    if (!this.ready) throw new Error('fetchTimetable()을 먼저 실행해주세요.');
    return this.data[grade][clazz][week];
  }
}

export default TimetableParser;
