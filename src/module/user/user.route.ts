import { Router } from "express";
import { userController } from "./user.controller";
import { authenticate } from "../../middleware/authentication";

const route = Router();


route.get("/me", authenticate, userController.getMyProfile);


export const userRoute = route;