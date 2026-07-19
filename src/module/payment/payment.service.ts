import {
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
  ServiceStatus,
} from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import config from "../../config";
import Stripe from "stripe";

// Create Payment Session
export const createPaymentSession = async (
  userId: string,
  bookingId: string,
) => {
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
              status: true,
            },
          },
        },
      },

      payment: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found.");
  }

  // Check booking owner
  if (booking.customer.id !== userId) {
    throw new Error("You are not authorized to make payment for this booking.");
  }

  // Technician must accept booking first
  if (booking.status === BookingStatus.REQUESTED) {
    throw new Error(
      "Payment is not available until technician accepts your booking.",
    );
  }

  if (booking.status !== BookingStatus.ACCEPTED) {
    throw new Error("Payment is only allowed for accepted bookings.");
  }

  // Check service availability
  if (booking.technicianService.service.status !== ServiceStatus.ACTIVE) {
    throw new Error("This service is currently unavailable.");
  }

  // Check existing completed payment
  if (booking.payment && booking.payment.status === PaymentStatus.COMPLETED) {
    throw new Error("This booking has already been paid.");
  }

  // If pending payment session already exists
  if (
    booking.payment &&
    booking.payment.status === PaymentStatus.PENDING &&
    booking.payment.stripeSessionId
  ) {
    const existingSession = await stripe.checkout.sessions.retrieve(
      booking.payment.stripeSessionId,
    );

    if (existingSession.status === "open" && existingSession.url) {
      return {
        checkoutUrl: existingSession.url,
      };
    }
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
    },

    success_url: `${config.app_url}/payment/success?bookingId=${booking.id}`,
    cancel_url: `${config.app_url}/payment/cancel?bookingId=${booking.id}`,
  });

  // Create or update payment record
  if (!booking.payment) {
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
  } else {
    await prisma.payment.update({
      where: {
        id: booking.payment.id,
      },

      data: {
        stripeSessionId: session.id,
        status: PaymentStatus.PENDING,
      },
    });
  }

  return {
    checkoutUrl: session.url,
  };
};

// Webhook Handler
const handleWebhook = async (payload: Buffer, signature: string) => {
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    config.stripe_webhook_secret,
  );

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
      );

      break;

    case "payment_intent.payment_failed":
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);

      break;

    case "checkout.session.expired":
      await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);

      break;

    default:
      console.log(`No events matched. Unhandled event type ${event.type}.`);
  }
};

// Checkout Session Completed
const handleCheckoutCompleted = async (session: Stripe.Checkout.Session) => {
  const bookingId = session.metadata?.bookingId;

  if (!bookingId) {
    throw new Error("Booking ID not found in metadata.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: {
        bookingId,
      },

      data: {
        transactionId: session.payment_intent as string,

        paymentMethod: PaymentMethod.CARD,

        status: PaymentStatus.COMPLETED,

        paidAt: new Date(),
      },
    });

    // Optional
    // If your business requires
    // payment before technician starts

    await tx.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: BookingStatus.PAID,
      },
    });
  });
};

// Payment Failed
const handlePaymentFailed = async (paymentIntent: Stripe.PaymentIntent) => {
  await prisma.payment.updateMany({
    where: {
      transactionId: paymentIntent.id,
    },

    data: {
      status: PaymentStatus.FAILED,
    },
  });
};

// Checkout Session Expired
const handleCheckoutExpired = async (session: Stripe.Checkout.Session) => {
  const bookingId = session.metadata?.bookingId;

  if (!bookingId) {
    return;
  }

  await prisma.payment.updateMany({
    where: {
      bookingId,
    },

    data: {
      status: PaymentStatus.FAILED,
    },
  });
};

// Get My Payments
export const getMyPayments = async (userId: string) => {
  const payments = await prisma.payment.findMany({
    where: {
      booking: {
        customerId: userId,
      },
    },
    include: {
      booking: {
        select: {
          id: true,
          bookingNumber: true,
          status: true,
          bookingDate: true,
          totalAmount: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return payments;
};

// Get Payment By Id
export const getPaymentById = async (paymentId: string, userId: string) => {
  const payment = await prisma.payment.findUniqueOrThrow({
    where: {
      id: paymentId,
    },
    include: {
      booking: {
        select: {
          id: true,
          bookingNumber: true,
          status: true,
          customerId: true,
          bookingDate: true,
          totalAmount: true,
        },
      },
    },
  });

  if (payment.booking.customerId !== userId) {
    throw new Error("You are not authorized to access this payment.");
  }

  return payment;
};

export const paymentService = {
  createPaymentSession,
  handleWebhook,
  getMyPayments,
  getPaymentById,
};
