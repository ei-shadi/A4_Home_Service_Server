import { UserStatus } from "@prisma/client";
import { ServiceStatus } from "@prisma/client";

export interface ICategory {
  name: string;
  icon?: string;
  description?: string;
  status?: TCategoryStatus;
}

export interface IService {
  categoryId: string;
  title: string;
  description?: string;
  status?: ServiceStatus;
}

export type TCategoryStatus = "ACTIVE" | "INACTIVE";

export interface IUpdateUserStatus {
  status: UserStatus;
}