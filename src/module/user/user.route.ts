import { Router } from "express";
import { userController } from "./user.controller";
import { authenticate } from "../../middleware/authentication";

const router = Router();


router.get("/me", authenticate, userController.getMyProfile);
router.patch("/me", authenticate, userController.updateMyProfile);


export const userRoute = router;