/**
 * Seed script to create admin user
 * Run: npx tsx prisma/seed.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "judebettlin@gmail.com";
const ADMIN_PASSWORD = "admin123"; // Change this!
const ADMIN_NAME = "Admin";

async function main() {
  console.log("🌱 Seeding admin user...");

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existingAdmin) {
    console.log(`✅ Admin user already exists: ${ADMIN_EMAIL}`);
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      isAdmin: true,
    },
  });

  console.log(`✅ Admin user created:`);
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log(`   ⚠️  Please change the password after first login!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
