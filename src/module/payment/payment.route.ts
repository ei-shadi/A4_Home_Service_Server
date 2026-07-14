import { Router } from "express";
import { authenticate } from "../../middleware/authentication";
import { paymentController } from "./payment.controller";
import { authorize } from "../../middleware/authorization";
import { USER_ROLE } from "../auth/auth.constant";

const route = Router();

route.post(
  "/checkout-session",
  authenticate,
  authorize(USER_ROLE.CUSTOMER, USER_ROLE.TECHNICIAN, USER_ROLE.ADMIN),
  paymentController.createPaymentSession,
);

export const paymentRoute = route;
