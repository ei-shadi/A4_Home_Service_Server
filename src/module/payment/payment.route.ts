import { Router } from "express";
import { authenticate } from "../../middleware/authentication";
import { paymentController } from "./payment.controller";
import { authorize } from "../../middleware/authorization";
import { USER_ROLE } from "../auth/auth.constant";

const router = Router();

router.post(
  "/checkout-session",
  authenticate,
  authorize(USER_ROLE.CUSTOMER, USER_ROLE.TECHNICIAN, USER_ROLE.ADMIN),
  paymentController.createPaymentSession,
);

router.post("/webhook", paymentController.handleWebhook);

router.get(
  "/",
  authenticate,
  authorize(USER_ROLE.CUSTOMER),
  paymentController.getMyPayments,
);

router.get(
  "/:id",
  authenticate,
  authorize(USER_ROLE.CUSTOMER),
  paymentController.getPaymentById,
);

export const paymentRoute = router;
