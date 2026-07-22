import { UserRole } from "../utils/enums.js";

export interface IDBUser {
  id: string;
  language: string;
  autoRedirect: boolean;
  t_left: number;
  tips: boolean;
  /**
   * @deprecated - Use `UserToken` Schema instead.
   */
  accessToken?: string;
  roles?: UserRole[];
  updatedAt: Date;
  createdAt: Date;
}
