import { USER_ROLE } from "../auth/auth.constant";

export type TUser = {
  id: string;
  name: string;
  email: string;
  role: (typeof USER_ROLE)[keyof typeof USER_ROLE];
};