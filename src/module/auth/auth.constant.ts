export const USER_ROLE = {
  ADMIN: "ADMIN",
  CUSTOMER: "CUSTOMER",
  TECHNICIAN: "TECHNICIAN",
} as const;

export type UserRole =
  (typeof USER_ROLE)[keyof typeof USER_ROLE];