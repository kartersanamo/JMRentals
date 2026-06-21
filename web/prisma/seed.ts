import { PrismaClient, UserRole } from "@prisma/client";
import { hashPassword } from "../lib/password";
import { DEFAULT_UNIT_IMAGES } from "../lib/unit-images";

const floorPlans = [
  {
    name: "Studio Retreat",
    beds: "Studio",
    baths: "1 Bath",
    description: "Cozy bayou-side living with modern finishes.",
    monthlyRent: 850,
    imageUrl: DEFAULT_UNIT_IMAGES["Studio Retreat"],
  },
  {
    name: "One Bedroom Classic",
    beds: "1 Bed",
    baths: "1 Bath",
    description: "Spacious layout perfect for comfortable everyday living.",
    monthlyRent: 1050,
    imageUrl: DEFAULT_UNIT_IMAGES["One Bedroom Classic"],
  },
  {
    name: "Two Bedroom Home",
    beds: "2 Beds",
    baths: "1 Bath Walk-In Closet",
    description: "Renovated home with room to spread out and unwind.",
    monthlyRent: 1250,
    imageUrl: DEFAULT_UNIT_IMAGES["Two Bedroom Home"],
  },
];

const defaultHomeInfo = {
  utilities: "Electric and water included. Tenant responsible for internet/cable.",
  trash: "Trash pickup is Tuesday and Friday. Bins at the rear of the property.",
  parking: "One assigned parking space per unit. Additional guest parking along West Main Street.",
  wifi: "Contact the office for recommended local internet providers.",
  emergency: "For maintenance emergencies after hours, call the office line and follow the prompt.",
};

const defaultChecklist = {
  "Signed lease received": false,
  "Move-in inspection completed": false,
  "Keys received": false,
  "Utilities set up": false,
  "Emergency contacts on file": false,
  "Parking assignment confirmed": false,
};

export async function seedDatabase(prisma: PrismaClient) {
  const address = "13049 West Main Street, Larose, LA 70373";

  for (const plan of floorPlans) {
    const existing = await prisma.unit.findFirst({ where: { name: plan.name } });
    if (!existing) {
      await prisma.unit.create({
        data: {
          ...plan,
          address,
          status: "AVAILABLE",
        },
      });
    } else if (!existing.imageUrl && plan.imageUrl) {
      await prisma.unit.update({
        where: { id: existing.id },
        data: { imageUrl: plan.imageUrl },
      });
    }
  }

  const settings = [
    { key: "home_info", value: JSON.stringify(defaultHomeInfo) },
    { key: "default_checklist", value: JSON.stringify(defaultChecklist) },
  ];

  for (const setting of settings) {
    await prisma.portalSetting.upsert({
      where: { key: setting.key },
      create: setting,
      update: { value: setting.value },
    });
  }

  const seedEmails = (process.env.ADMIN_SEED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const seedPassword = process.env.ADMIN_SEED_PASSWORD;
  if (seedEmails.length > 0 && seedPassword) {
    const passwordHash = await hashPassword(seedPassword);
    for (const email of seedEmails) {
      await prisma.user.upsert({
        where: { email },
        create: {
          email,
          passwordHash,
          role: UserRole.ADMIN,
          firstName: "Admin",
          lastName: email.split("@")[0] ?? "User",
          mustChangePassword: true,
          emailVerifiedAt: new Date(),
        },
        update: {},
      });
    }
    console.log(`Seeded ${seedEmails.length} admin account(s).`);
  } else {
    console.log("Skipping admin seed — set ADMIN_SEED_EMAILS and ADMIN_SEED_PASSWORD.");
  }
}
