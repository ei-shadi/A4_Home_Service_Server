import { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../shared/utils/catchAsync";
import { sendResponse } from "../../shared/utils/sendResponse";
import { adminService } from "./admin.service";

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.updateCategoryIntoDB(
    req.params.id as string,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Category updated successfully.",
    data: result,
  });
});

export const adminController = {
  updateCategory,
};