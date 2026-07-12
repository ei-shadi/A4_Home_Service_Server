import { USER_ROLE } from "../auth/auth.constant";

export type TUser = {
  id: string;
  name: string;
  email: string;
  role: (typeof USER_ROLE)[keyof typeof USER_ROLE];
};

export type TUserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BANNED";

export interface IUpdateUserProfile {
  name?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}