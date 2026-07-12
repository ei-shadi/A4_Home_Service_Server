import { PrismaClient } from "@prisma/client";

const services = [
  { category: "Plumbing", name: "Pipe Repair", description: "Repair leaking and damaged pipes." },
  { category: "Plumbing", name: "Leak Detection", description: "Detect hidden water leaks." },
  { category: "Electrical", name: "House Wiring", description: "Complete electrical wiring." },
  { category: "Electrical", name: "Fan Installation", description: "Install ceiling and exhaust fans." },
  { category: "Cleaning", name: "Deep Cleaning", description: "Complete home deep cleaning." },
  { category: "Painting", name: "Interior Painting", description: "Professional wall painting." },
  { category: "Carpentry", name: "Furniture Repair", description: "Repair wooden furniture." },
  { category: "AC Repair", name: "AC Servicing", description: "AC maintenance and servicing." },
  { category: "Pest Control", name: "Termite Control", description: "Professional termite treatment." },
  { category: "CCTV Installation", name: "CCTV Camera Installation", description: "Install CCTV security systems." },
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
        categoryId_name: {
          categoryId: category.id,
          name: service.name,
        },
      },
      update: {},
      create: {
        name: service.name,
        description: service.description,
        categoryId: category.id,
      },
    });
  }

  console.log("✅ Services seeded.");
};