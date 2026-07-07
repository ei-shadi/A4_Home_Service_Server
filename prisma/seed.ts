import { PrismaClient } from "@prisma/client";
import { seedRoles } from "./seeds/role.seed";

const prisma = new PrismaClient();

async function main() {
  await seedRoles(prisma);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });