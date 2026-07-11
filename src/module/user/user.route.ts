import { Router } from "express";
import { servicesController } from "../services/services.controller";

const route = Router();


route.get("/", servicesController.getAllServices);


export const userRoute = route;