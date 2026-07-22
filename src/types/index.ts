// Shared TypeScript types + enums for the SupportMail ecosystem.
//
// Pure types/enums only — zero runtime deps, zero env, zero I/O. This is the
// tier consumers can always import safely (browser, CF Workers, Bun, Node).
//
// Migrate the contents of the old `sm-types` submodule here over time.

export interface IUserToken {
  userId: string;
  accessToken: string;
  refreshToken: string | null;
  clearance: "user" | "admin";
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
