import { BookingStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import config from "../../config";

export const createPaymentSession = async (
  userId: string,
  bookingId: string,
) => {
  // Find booking with customer and service information
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      technicianService: {
        include: {
          service: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (!booking) {
    throw new Error("Booking not found.");
  }

  // Ensure the booking belongs to the logged-in customer
  if (booking.customer.id !== userId) {
    throw new Error("You are not authorized to pay for this booking.");
  }

  // Booking must be accepted before payment
  if (booking.status !== BookingStatus.ACCEPTED) {
    throw new Error("Payment can only be made for accepted bookings.");
  }

  // Check existing payment
  const existingPayment = await prisma.payment.findUnique({
    where: {
      bookingId,
    },
  });

  if (existingPayment && existingPayment.status === PaymentStatus.COMPLETED) {
    throw new Error("This booking has already been paid.");
  }

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: booking.customer.email,

    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "bdt",
          unit_amount: Number(booking.totalAmount) * 100,
          product_data: {
            name: booking.technicianService.service.name,
            description:
              booking.technicianService.service.description ?? undefined,
          },
        },
      },
    ],

    metadata: {
      bookingId: booking.id,
      customerId: booking.customer.id,
    },

    success_url: `${config.app_url}/payment/success?bookingId=${booking.id}`,
    cancel_url: `${config.app_url}/payment/cancel?bookingId=${booking.id}`,
  });

  // Create payment record if it doesn't exist
  if (!existingPayment) {
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        stripeSessionId: session.id, 
        amount: booking.totalAmount,
        paymentMethod: PaymentMethod.CARD,
        paymentProvider: "STRIPE",
        currency: "BDT",
        status: PaymentStatus.PENDING,
      },
    });
  }

  return {
    checkoutUrl: session.url
  };
};

export const paymentService = {
  createPaymentSession,
};
