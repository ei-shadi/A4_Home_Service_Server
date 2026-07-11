import { Router } from "express";
import { authenticate } from "../../middleware/authentication";
import { authorize } from "../../middleware/authorization";
import { USER_ROLE } from "../auth/auth.constant";
import { adminController } from "./admin.controller";

const route = Router();


route.put("/categories", authenticate, authorize(USER_ROLE.ADMIN), adminController.updateCategory);


export const adminRoute = route;