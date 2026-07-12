import { AvailabilityStatus, PricingType, ServiceStatus } from "@prisma/client";

export interface IUpdateTechnicianProfile {
  bio?: string;
  yearsOfExperience?: number;
  experienceDescription?: string;
  availabilityStatus?: AvailabilityStatus;

  technicianServices?: IUpdateTechnicianService[];
}

export interface IUpdateTechnicianService {
  serviceId: string;
  price: number;
  pricingType: PricingType;
  estimatedDuration: number;
  serviceImage?: string;
  status?: ServiceStatus;
}
