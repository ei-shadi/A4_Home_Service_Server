import { Router } from "express";
import { userController } from "./admin.controller";
import { authenticate } from "../../middleware/authentication";

const route = Router();


route.get("/", authenticate, userController.getMyProfile);


export const userRoute = route;