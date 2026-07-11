import { Router } from "express";
import { authenticate } from "../../middleware/authentication";
import { authorize } from "../../middleware/authorization";
import { USER_ROLE } from "../auth/auth.constant";
import { adminController } from "./admin.controller";

const route = Router();
 
route.get("/users", authenticate, authorize(USER_ROLE.ADMIN), adminController.getAllUsers);
route.get("/bookings", authenticate, authorize(USER_ROLE.ADMIN), adminController.getAllBookings);
route.get("/categories", authenticate, authorize(USER_ROLE.ADMIN), adminController.getAllCategories);
route.put("/categories", authenticate, authorize(USER_ROLE.ADMIN), adminController.updateCategory);


export const adminRoute = route;