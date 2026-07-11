import { Router } from "express";
import { technicianController } from "./technician.controller";
import { authenticate } from "../../middleware/authentication";
import { authorize } from "../../middleware/authorization";
import { USER_ROLE } from "../auth/auth.constant";

const route = Router();


route.put(
  "/profile",
  authenticate,
  authorize(USER_ROLE.TECHNICIAN),
  technicianController.updateProfile,
);

// route.put(
//   "/availability",
//   authenticate,
//   authorize(USER_ROLE.TECHNICIAN),
//   technicianController.updateAvailability,
// );

// route.get(
//   "/bookings",
//  authenticate,
//   authorize(USER_ROLE.TECHNICIAN),
//   technicianController.getMyBookings,
// );

// route.patch(
//   "/bookings/:id",
//   authenticate,
//   authorize(USER_ROLE.TECHNICIAN),
//   technicianController.updateBookingStatus,
// );


export const technicianRoute = route;