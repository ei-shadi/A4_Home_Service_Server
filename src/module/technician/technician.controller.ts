import { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../shared/utils/catchAsync";
import { sendResponse } from "../../shared/utils/sendResponse";
import { technicianService } from "./technician.service";


// Get My Bookings
const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await technicianService.getMyBookingsFromDB(req.user!.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "My Bookings retrieved successfully",
    data: result,
  });
});

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

// Update Availability Status
const updateAvailabilityStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await technicianService.updateAvailabilityStatusIntoDB(
    req.user!.id,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Availability status updated successfully",
    data: result,
  });
});

// Update Bookings Status
const updateBookingsStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await technicianService.updateBookingStatusIntoDB(
    req.user!.id,
    req.params.bookingId as string,
    req.body
  );


  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking status updated successfully",
    data: result,
  });
});

export const technicianController = {
  getMyBookings,
  updateProfile,
  updateAvailabilityStatus,
  updateBookingsStatus
};