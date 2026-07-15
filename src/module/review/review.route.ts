import { Router } from "express";
import { authenticate } from "../../middleware/authentication";
import { reviewController } from "./review.controller";

const router = Router();


// router.get("/me", authenticate, reviewController);


export const userRoute = router;