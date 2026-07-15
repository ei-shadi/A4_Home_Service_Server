import { sendResponse } from "../../shared/utils/sendResponse";
import { catchAsync } from "../../shared/utils/catchAsync";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { paymentService } from "./payment.service";

// Create Payment Session
const createPaymentSession = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.createPaymentSession(
    req.user!.id,
    req.body.bookingId,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment session created successfully",
    data: result,
  });
});

// Webhook Handler
const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const event = req.body as Buffer;
  const signature = req.headers["stripe-signature"] as string;

  await paymentService.handleWebhook(event, signature);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Webhook Triggered Successfully",
    data: null,
  });
});

// Get My Payments
const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.getMyPayments(req.user!.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "My Payments retrieved successfully",
    data: result,
  });
});

// Get Payment By Id
const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.getPaymentById(
    req.params.id as string,
    req.user!.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment retrieved successfully",
    data: result,
  });
})

export const paymentController = {
  createPaymentSession,
  handleWebhook,
  getMyPayments,
  getPaymentById
};
