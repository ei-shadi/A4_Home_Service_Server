import { Router } from "express";
import { technicianController } from "./technician.controller";
import { authenticate } from "../../middleware/authentication";
import { authorize } from "../../middleware/authorization";
import { USER_ROLE } from "../auth/auth.constant";

const router = Router();


// Update Profile
router.put(
  "/profile",
  authenticate,
  authorize(USER_ROLE.TECHNICIAN),
  technicianController.updateProfile,
);

// Update Availability
router.patch(
  "/availability",
  authenticate,
  authorize(USER_ROLE.TECHNICIAN),
  technicianController.updateAvailabilityStatus,
);

// Get My Bookings
router.get(
  "/bookings",
 authenticate,
  authorize(USER_ROLE.TECHNICIAN),
  technicianController.getMyBookings,
);

// Update Bookings
router.patch(
  "/bookings/:bookingId",
  authenticate,
  authorize(USER_ROLE.TECHNICIAN),
  technicianController.updateBookingsStatus,
);


export const technicianRoute = router;