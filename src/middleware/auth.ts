import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import config from "../config";
import { catchAsync } from "../shared/utils/catchAsync";
import { jwtUtils } from "../shared/utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: string;
      };
    }
  }
}

export const auth = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization?.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new Error("Unauthorized Access");
    }

    const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

    if (!verifiedToken.success) {
      throw new Error(verifiedToken.error);
    }

    const payload = verifiedToken.data as JwtPayload;

    const user = await prisma.user.findUnique({
      where: {
        id: payload.id,
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.status === "BANNED") {
      throw new Error("Your account is banned");
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
    };

    next();
  },
);
