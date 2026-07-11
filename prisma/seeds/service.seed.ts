import { PrismaClient } from "@prisma/client";

const services = [
  {
    category: "Plumbing",
    title: "Pipe Repair",
    description: "Repair leaking and damaged pipes.",
  },
  {
    category: "Plumbing",
    title: "Leak Detection",
    description: "Detect hidden water leaks.",
  },
  {
    category: "Electrical",
    title: "House Wiring",
    description: "Complete electrical wiring.",
  },
  {
    category: "Electrical",
    title: "Fan Installation",
    description: "Install ceiling and exhaust fans.",
  },
  {
    category: "Cleaning",
    title: "Deep Cleaning",
    description: "Complete home deep cleaning.",
  },
  {
    category: "Painting",
    title: "Interior Painting",
    description: "Professional wall painting.",
  },
  {
    category: "Carpentry",
    title: "Furniture Repair",
    description: "Repair wooden furniture.",
  },
  {
    category: "AC Repair",
    title: "AC Servicing",
    description: "AC maintenance and servicing.",
  },
  {
    category: "Pest Control",
    title: "Termite Control",
    description: "Professional termite treatment.",
  },
  {
    category: "CCTV Installation",
    title: "CCTV Camera Installation",
    description: "Install CCTV security systems.",
  },
];

export const seedServices = async (prisma: PrismaClient) => {
  for (const service of services) {
    const category = await prisma.category.findUnique({
      where: {
        name: service.category,
      },
    });

    if (!category) continue;

    await prisma.service.upsert({
      where: {
        categoryId_title: {
          categoryId: category.id,
          title: service.title,
        },
      },
      update: {},
      create: {
        title: service.title,
        description: service.description,
        categoryId: category.id,
      },
    });
  }

  console.log("✅ Services seeded.");
};