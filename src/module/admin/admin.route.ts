import { Router } from "express";
import { authenticate } from "../../middleware/authentication";
import { authorize } from "../../middleware/authorization";
import { USER_ROLE } from "../auth/auth.constant";
import { adminController } from "./admin.controller";

const route = Router();

// Get All Users Api
route.get(
  "/users",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  adminController.getAllUsers,
);

// Get All Bookings Api
route.get(
  "/bookings",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  adminController.getAllBookings,
);

// Get All Categories Api
route.get(
  "/categories",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  adminController.getAllCategories,
);

// Update User Status Api
route.patch(
  "/users/:id",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  adminController.updateUserStatus,
);

// Update Category
route.put(
  "/categories",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  adminController.updateCategory,
);

export const adminRoute = route;
