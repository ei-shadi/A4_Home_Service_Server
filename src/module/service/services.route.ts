import { Router } from "express";
import { servicesController } from "./services.controller";
import { authenticate } from "../../middleware/authentication";
import { authorize } from "../../middleware/authorization";
import { USER_ROLE } from "../auth/auth.constant";

const route = Router();

route.get("/services/list", authenticate, authorize(USER_ROLE.ADMIN, USER_ROLE.TECHNICIAN), servicesController.getAllServices);
route.get("/services", servicesController.getAllTechnicianServices);
route.get("/technicians", servicesController.getAllTechnicians);
route.get("/technicians/:id", servicesController.getTechnicianById);
route.get("/categories", servicesController.getAllCategories);


export const serviceRoute = route;