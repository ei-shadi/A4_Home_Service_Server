export interface IUpdateCategory {
  name: string;
  icon?: string;
  description?: string;
  status?: TCategoryStatus;
}

export type TCategoryStatus = "ACTIVE" | "INACTIVE";