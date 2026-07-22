//#region src/types/index.d.ts
interface IUserToken {
  userId: string;
  accessToken: string;
  refreshToken: string | null;
  clearance: "user" | "admin";
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
//#endregion
export { IUserToken as t };