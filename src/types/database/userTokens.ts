export interface IUserToken {
  userId: string;
  accessToken: string;
  refreshToken: string | null;
  /**
   * The clearance level of the user
   *
   * "user" or missing - regular user access
   * "mod" - moderator access
   * "admin" - admin access
   */
  clearance?: "user" | "mod" | "admin";
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
