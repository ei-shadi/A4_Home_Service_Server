import { prisma } from "../src/lib/prisma";
import { seedRoles } from "./seeds/role.seed";
import { seedAdmin } from "./seeds/admin.seed";
import { seedCategories } from "./seeds/category.seed";
import { seedServices } from "./seeds/service.seed";

async function main() {
  console.log("🌱 Seeding started...");

  await seedRoles(prisma);
  await seedAdmin(prisma);
  await seedCategories(prisma);
  await seedServices(prisma);

  console.log("✅ Database seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });