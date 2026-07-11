import { sendResponse } from "../../shared/utils/sendResponse";
import { catchAsync } from "../../shared/utils/catchAsync";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { servicesService } from "./services.service";

const getAllServices = catchAsync(async (req: Request, res: Response) => {
  const result = await servicesService.getAllServicesFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Services retrieved successfully",
    data: result,
  });
});

export const servicesController = {
  getAllServices,
};
