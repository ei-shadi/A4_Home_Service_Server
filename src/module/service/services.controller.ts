import { sendResponse } from "../../shared/utils/sendResponse";
import { catchAsync } from "../../shared/utils/catchAsync";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { servicesService } from "./services.service";

// Get All Services
const getAllServices = catchAsync(async (req: Request, res: Response) => {
  const result = await servicesService.getAllServicesFromDB();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All Services retrieved successfully",
    data: result,
  });
});

// Get All Technician Services
const getAllTechnicianServices = catchAsync(
  async (req: Request, res: Response) => {
    const result = await servicesService.getAllTechnicianServicesFromDB(
      req.query,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All Services retrieved successfully",
      data: result,
    });
  },
);

export const servicesController = {
  getAllServices,
  getAllTechnicianServices,
};
