import { Router } from "express";
import { authenticate } from "../../middleware/authentication";
import { reviewController } from "./review.controller";
import { authorize } from "../../middleware/authorization";
import { USER_ROLE } from "../auth/auth.constant";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(USER_ROLE.CUSTOMER),
  reviewController.createReview,
);

export const reviewRoute = router;
