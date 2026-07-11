import bcrypt from "bcryptjs";
import { PrismaClient, UserStatus } from "@prisma/client";

export const seedAdmin = async (prisma: PrismaClient) => {
  const role = await prisma.role.findUnique({
    where: {
      name: "ADMIN",
    },
  });

  if (!role) {
    throw new Error("ADMIN role not found.");
  }

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: "eis@gmail.com",
    },
  });

  if (existingAdmin) {
    console.log("✅ Admin already exists.");
    return;
  }

  const hashedPassword = await bcrypt.hash("eisadmin", 10);

  await prisma.user.create({
    data: {
      roleId: role.id,
      name: "Eftajul Islam Shadi",
      email: "eis@gmail.com",
      phone: "01710000000",
      passwordHash: hashedPassword,
      address: "Dhaka, Bangladesh",
      city: "Dhaka",
      status: UserStatus.ACTIVE,
    },
  });

  console.log("✅ Admin seeded.");
};