declare module 'comcigan-parser' {
  interface option {
    readonly firstNames: any[];
    readonly maxGrade: number;
    readonly timetableThreshold: number;
  }

  export default class Timetable {
    init(option: option): Promise<any>

    setSchool(keyword: string): Promise<any>

    getTimetable(): Promise<any>

    getClassTime(): string[]
  }
}
