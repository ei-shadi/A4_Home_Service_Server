import { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../shared/utils/catchAsync";
import { sendResponse } from "../../shared/utils/sendResponse";
import { technicianService } from "./technician.service";


// Update Profile
const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await technicianService.updateProfileIntoDB(
    req.user!.id,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile updated successfully",
    data: result,
  });
});

export const technicianController = {
  updateProfile,
};