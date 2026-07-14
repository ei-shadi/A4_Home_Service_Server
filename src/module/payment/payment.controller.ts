import { sendResponse } from "../../shared/utils/sendResponse";
import { catchAsync } from "../../shared/utils/catchAsync";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { paymentService } from "./payment.service";


// Create Payment Session
const createPaymentSession = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.createPaymentSession(
    req.user!.id,
    req.body.bookingId
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment session created successfully",
    data: result,
  });
});


export const paymentController = {
  createPaymentSession
};
