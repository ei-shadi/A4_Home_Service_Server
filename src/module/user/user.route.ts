import { Router } from "express";
import { userController } from "./user.controller";
import { authenticate } from "../../middleware/authentication";

const route = Router();


route.get("/me", authenticate, userController.getMyProfile);
route.patch("/me", authenticate, userController.updateMyProfile);


export const userRoute = route;