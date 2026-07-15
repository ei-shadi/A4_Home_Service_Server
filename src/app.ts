import { notFound } from './middleware/notFound';
import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "./config";
import { authRoute } from "./module/auth/auth.route";
import { globalErrorHandler } from './middleware/globalErrorHandler';
import { userRoute } from './module/user/user.route';
import { technicianRoute } from './module/technician/technician.route';
import { adminRoute } from './module/admin/admin.route';
import { serviceRoute } from './module/service/services.route';
import { bookingRoute } from './module/booking/booking.route';
import { paymentRoute } from './module/payment/payment.route';
import { stripe } from './lib/stripe';


const app : Application = express();


// Middleware
app.use(cors({
    origin: config.app_url,
    credentials: true,
}));

const endpointSecret = config.stripe_webhook_secret;

// app.post("/api/payments/webhook", express.raw({ type: 'application/json'}), (request, response) => {
//    let event = request.body;
//    console.log(event, "stripe request body");
//    console.log(request.headers, "stripe request headers")
//   // Only verify the event if you have an endpoint secret defined.
//   // Otherwise use the basic event deserialized with JSON.parse
//   if (endpointSecret) {
//     // Get the signature sent by Stripe
//     const signature = request.headers['stripe-signature']!;
//     try {
//       event = stripe.webhooks.constructEvent(
//         request.body,
//         signature,
//         endpointSecret
//       );
//     } catch (err: any) {
//       console.log(`⚠️  Webhook signature verification failed.`, err.message);
//       return response.sendStatus(400).json({ error: err.message });
//     }
//   }

//   console.log(event, "Event after try block")

//   // Handle the event
//   switch (event.type) {
//     case 'payment_intent.succeeded':
//       const paymentIntent = event.data.object;
//       console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
//       // Then define and call a method to handle the successful payment intent.
//       // handlePaymentIntentSucceeded(paymentIntent);
//       break;
//     case 'payment_method.attached':
//       const paymentMethod = event.data.object;
//       // Then define and call a method to handle the successful attachment of a PaymentMethod.
//       // handlePaymentMethodAttached(paymentMethod);
//       break;
//     default:
//       // Unexpected event type
//       console.log(`Unhandled event type ${event.type}.`);
//   }

//   // Return a 200 response to acknowledge receipt of the event
//   response.send();
// })

app.use("/api/payments/webhook", express.raw({ type: 'application/json'}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Server Activation MSG
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Home Service Server is running successfully!",
    author: "Eftajul Islam Shadi",
  });
});


// Auth Routes
app.use("/api/auth", authRoute)
// Admin Routes
app.use("/api/admin", adminRoute);
// User Routes
app.use("/api/users", userRoute);
// Technician Routes
app.use("/api/technician", technicianRoute);
// Services Routes
app.use("/api", serviceRoute);
// Booking Routes
app.use("/api/booking", bookingRoute);
// Payments Routes
app.use("/api/payments", paymentRoute);

// Review Routes


// Not Found Middleware
app.use(notFound);

// Global Error Handler Middleware
app.use(globalErrorHandler);

export default app