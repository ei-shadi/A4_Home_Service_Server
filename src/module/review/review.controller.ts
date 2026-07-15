import { reviewService } from './review.service';
import { sendResponse } from "../../shared/utils/sendResponse";
import { catchAsync } from "../../shared/utils/catchAsync";
import { Request, Response } from "express";
import httpStatus from "http-status";

// Create Review
const createReview = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewService.createReviewIntoDB(
    req.user!.id,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Review submitted successfully.",
    data: result,
  });
});


export const reviewController = {
  createReview
};
