import { NextFunction, Request, Response } from "express";

export const authorize =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {

    if (!req.user) {
      throw new Error("Unauthorized Access");
    }

    if (!roles.includes(req.user.role)) {
      throw new Error("Forbidden Access");
    }

    next();
};