import { Router } from "express";
import { userController } from "./user.controller";
import { auth } from "../../middleware/auth";

const route = Router();


route.get("/me", auth, userController.getMyProfile);


export const userRoute = route;