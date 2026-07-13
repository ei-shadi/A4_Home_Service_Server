export interface ICreateBooking {
  technicianServiceId: string;
  bookingDate: string;
  scheduledStart: string;
  scheduledEnd: string;
  serviceAddress: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}
