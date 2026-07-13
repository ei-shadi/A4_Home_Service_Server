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


const app : Application = express();


// Middleware
app.use(cors({
    origin: config.app_url,
    credentials: true,
}));
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

// Not Found Middleware
app.use(notFound);

// Global Error Handler Middleware
app.use(globalErrorHandler);

export default app