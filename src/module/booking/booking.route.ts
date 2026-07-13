import { Router } from "express";
import { authenticate } from "../../middleware/authentication";
import { authorize } from "../../middleware/authorization";
import { USER_ROLE } from "../auth/auth.constant";
import { bookingController } from "./booking.controller";


const route = Router();
// Get logged-in user's bookings
route.get(
  "/",
  authenticate,
  bookingController.getMyBookings
);


// Get single booking details
route.get(
  "/:id",
  authenticate,
  bookingController.getBookingById
);

// Create a new booking
route.post(
  "/",
  authenticate,
  authorize(USER_ROLE.CUSTOMER),
  bookingController.createBookings
);



export const bookingRoute = route;