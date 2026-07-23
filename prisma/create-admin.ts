import { PrismaClient, UserRole } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const [name, email, password, role] = process.argv.slice(2);

  if (!name || !email || !password) {
    console.error("Usage: npx tsx prisma/create-admin.ts \"Full Name\" email@example.com password [ROLE]");
    console.error(`Valid roles: ${Object.values(UserRole).join(", ")}`);
    process.exit(1);
  }

  const resolvedRole = role && Object.values(UserRole).includes(role as UserRole) ? (role as UserRole) : UserRole.SUPER_ADMIN;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.error(`A user with email ${email} already exists.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: resolvedRole },
  });

  console.log(`Created user: ${user.name} <${user.email}> (${user.role})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
