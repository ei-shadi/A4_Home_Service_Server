import { Router } from "express";
import { authenticate } from "../../middleware/authentication";
import { reviewController } from "./review.controller";

const route = Router();


// route.get("/me", authenticate, reviewController);


export const userRoute = route;