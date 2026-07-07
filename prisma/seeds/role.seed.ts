import { PrismaClient } from "@prisma/client";

export async function seedRoles(prisma: PrismaClient): Promise<void> {
  await prisma.role.createMany({
    data: [
      {
        name: "CUSTOMER",
        description: "Regular customer",
      },
      {
        name: "TECHNICIAN",
        description: "Service provider",
      },
      {
        name: "ADMIN",
        description: "System administrator",
      }
    ],
    skipDuplicates: true,
  });

  console.log("✅ Roles seeded successfully.");
}