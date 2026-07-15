import { BookingStatus, PaymentStatus } from "@prisma/client";

import { prisma } from "../../lib/prisma";
import { ICreateReview } from "./review.interface";


const createReviewIntoDB = async (
  userId: string,
  payload: ICreateReview,
) => {

  const booking = await prisma.booking.findUnique({
    where: {
      id: payload.bookingId,
    },

    include: {
      payment: true,
      review: true,
      technicianService: {
        include: {
          technician: true,
        },
      },
    },
  });


  if (!booking) {
    throw new Error("Booking not found.");
  }


  // Customer ownership check
  if (booking.customerId !== userId) {
    throw new Error(
      "You are not authorized to review this booking.",
    );
  }


  // Job must be completed
  if (booking.status !== BookingStatus.COMPLETED) {
    throw new Error(
      "Review is only allowed after job completion.",
    );
  }


  // Payment check
  if (
    !booking.payment ||
    booking.payment.status !== PaymentStatus.COMPLETED
  ) {
    throw new Error(
      "Payment must be completed before review.",
    );
  }


  // Prevent duplicate review
  if (booking.review) {
    throw new Error(
      "Review already exists for this booking.",
    );
  }


  const review = await prisma.review.create({
    data: {
      bookingId: booking.id,
      rating: payload.rating,
      comment: payload.comment,
    },
  });


  return review;
};


export const reviewService = {
  createReviewIntoDB,
};