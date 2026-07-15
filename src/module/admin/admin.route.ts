import { Router } from "express";
import { authenticate } from "../../middleware/authentication";
import { authorize } from "../../middleware/authorization";
import { USER_ROLE } from "../auth/auth.constant";
import { adminController } from "./admin.controller";

const router = Router();

// Get All Users Api
router.get(
  "/users",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  adminController.getAllUsers,
);

// Get All Bookings Api
router.get(
  "/bookings",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  adminController.getAllBookings,
);

// Get All Categories Api
router.get(
  "/categories",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  adminController.getAllCategories,
);

// Create Category Api
router.post(
  "/categories",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  adminController.createCategory,
);

// Create Service Api
router.post(
  "/services",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  adminController.createService,
)

// Update User Status Api
router.patch(
  "/users/:id",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  adminController.updateUserStatus,
);



export const adminRoute = router;