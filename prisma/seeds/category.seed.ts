import { PrismaClient } from "@prisma/client";

const categories = [
  {
    name: "Plumbing",
    icon: "plumbing.png",
    description: "Professional plumbing services",
  },
  {
    name: "Electrical",
    icon: "electrical.png",
    description: "Electrical installation and repair",
  },
  {
    name: "Cleaning",
    icon: "cleaning.png",
    description: "Residential cleaning services",
  },
  {
    name: "Painting",
    icon: "painting.png",
    description: "Interior and exterior painting",
  },
  {
    name: "Carpentry",
    icon: "carpentry.png",
    description: "Woodwork and furniture repair",
  },
  {
    name: "AC Repair",
    icon: "ac.png",
    description: "Air conditioner repair",
  },
  {
    name: "Pest Control",
    icon: "pest.png",
    description: "Pest removal service",
  },
  {
    name: "Appliance Repair",
    icon: "appliance.png",
    description: "Home appliance repair",
  },
  {
    name: "Home Shifting",
    icon: "moving.png",
    description: "Home relocation service",
  },
  {
    name: "CCTV Installation",
    icon: "cctv.png",
    description: "Security camera installation",
  },
];

export const seedCategories = async (prisma: PrismaClient) => {
  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        name: category.name,
      },
      update: {},
      create: category,
    });
  }

  console.log("✅ Categories seeded.");
};