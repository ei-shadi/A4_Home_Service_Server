import { UserStatus } from "@prisma/client";

export interface IUpdateCategory {
  name: string;
  icon?: string;
  description?: string;
  status?: TCategoryStatus;
}

export type TCategoryStatus = "ACTIVE" | "INACTIVE";


export interface IUpdateUserStatus {
  status: UserStatus;
}