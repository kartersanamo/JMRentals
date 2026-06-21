import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "./seed";

const prisma = new PrismaClient();

seedDatabase(prisma)
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
