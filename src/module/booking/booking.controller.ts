import { sendResponse } from "../../shared/utils/sendResponse";
import { catchAsync } from "../../shared/utils/catchAsync";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { bookingService } from "./booking.service";

// Get My Bookings
const getMyBookings = catchAsync(async(req:Request,res:Response)=>{
    const result =
      await bookingService.getMyBookingsFromDB(
        req.user!.id
      );

    sendResponse(res,{
      statusCode:200,
      success:true,
      message:"Bookings retrieved successfully.",
      data:result
    });

  }
);

// Get Booking By Id
const getBookingById = catchAsync( async(req:Request,res:Response)=>{
    const result =
      await bookingService.getBookingByIdFromDB(
        req.user!.id,
        req.params.id as string
      );


    sendResponse(res,{
      statusCode:200,
      success:true,
      message:"Booking details retrieved successfully.",
      data:result
    });


  }
);

// Create Bookings
const createBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await bookingService.createBookingIntoDB(
    req.user!.id,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Bookings created successfully.",
    data: result,
  });
});

export const bookingController = {
  getMyBookings,
  getBookingById,
  createBookings,
};
