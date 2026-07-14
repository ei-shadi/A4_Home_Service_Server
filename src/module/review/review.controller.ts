import { sendResponse } from "../../shared/utils/sendResponse";
import { catchAsync } from "../../shared/utils/catchAsync";
import { Request, Response } from "express";
import httpStatus from "http-status";

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


export const reviewController = {

};
