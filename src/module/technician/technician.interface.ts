import { AvailabilityStatus, PricingType, ServiceStatus } from "@prisma/client";

export interface IUpdateAvailabilityStatus {
  availabilityStatus: AvailabilityStatus;
}

export interface ITechnicianUpdateBookingStatus {
  status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED";
}

export interface IUpdateTechnicianProfile {
  bio?: string;
  yearsOfExperience?: number;
  experienceDescription?: string;
  availabilityStatus?: AvailabilityStatus;

  averageRating?: number;
  totalReviews?: number;
  totalCompletedJobs?: number;

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
