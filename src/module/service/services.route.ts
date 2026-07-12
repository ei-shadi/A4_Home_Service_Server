import { Router } from "express";
import { servicesController } from "./services.controller";

const route = Router();

route.get("/list", servicesController.getAllServices);
route.get("/", servicesController.getAllTechnicianServices);


export const serviceRoute = route;