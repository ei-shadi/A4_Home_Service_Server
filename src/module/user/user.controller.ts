import { sendResponse } from "../../shared/utils/sendResponse";
import { catchAsync } from "../../shared/utils/catchAsync";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { userService } from "./user.service";

// Get My Profile
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const profile = await userService.getMyProfileFromDB(req.user!);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User profile fetched successfully",
    data: profile,
  });
});

// Update My Profile
const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const profile = await userService.updateProfileIntoDB(req.user!.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User profile updated successfully",
    data: profile,
  });
});

export const userController = {
  getMyProfile,
  updateMyProfile,
};
