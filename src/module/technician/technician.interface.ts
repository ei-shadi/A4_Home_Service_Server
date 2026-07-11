export type TUpdateAvailability = {
  availabilityStatus: "ONLINE" | "OFFLINE" | "BUSY";
};

export type TUpdateTechnicianProfile = {
  bio?: string;
  yearsOfExperience?: number;
  profileImage?: string;
  address?: string;
  city?: string;
};