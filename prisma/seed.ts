import { prisma } from "../src/lib/prisma";
import { seedRoles } from "./seeds/role.seed";

async function main() {
  await seedRoles(prisma);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });