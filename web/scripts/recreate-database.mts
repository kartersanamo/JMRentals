import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set.");
}

const serverUrl = databaseUrl.replace(/\/[^/?]+(\?.*)?$/, "/mysql$1");
const dbNameMatch = databaseUrl.match(/\/([^/?]+)(\?|$)/);
const dbName = dbNameMatch?.[1];
if (!dbName) {
  throw new Error("Could not parse database name from DATABASE_URL.");
}

const prisma = new PrismaClient({
  datasources: { db: { url: serverUrl } },
});

async function main() {
  await prisma.$executeRawUnsafe(`DROP DATABASE IF EXISTS \`${dbName}\``);
  await prisma.$executeRawUnsafe(
    `CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  console.log(`Recreated database: ${dbName}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
