import { Router } from "express";
import { servicesController } from "./services.controller";
import { authenticate } from "../../middleware/authentication";
import { authorize } from "../../middleware/authorization";
import { USER_ROLE } from "../auth/auth.constant";

const router = Router();

router.get("/services/list", authenticate, authorize(USER_ROLE.ADMIN, USER_ROLE.TECHNICIAN), servicesController.getAllServices);
router.get("/services", servicesController.getAllTechnicianServices);
router.get("/technicians", servicesController.getAllTechnicians);
router.get("/technicians/:id", servicesController.getTechnicianById);
router.get("/categories", servicesController.getAllCategories);


export const serviceRoute = router;