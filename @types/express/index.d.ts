export {};

declare global {
  namespace Express {
    interface UserModel {
      readonly uuid: string;
      readonly id: string;
      readonly name: string;
      readonly department: number;
      readonly studentGrade: number;
      readonly studentClass: number;
      readonly studentNumber: number;
      readonly password?: string;
      readonly createdAt: Date;
      readonly updatedAt: Date;
      readonly deletedAt?: Date;
      readonly permission: {
        readonly isAdmin: boolean;
        readonly isTeacher: boolean;
        readonly isSchoolUnion: boolean;
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface User extends UserModel {}
  }
}
