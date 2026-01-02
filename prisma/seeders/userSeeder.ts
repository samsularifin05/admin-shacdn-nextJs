import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

type UserStatus = "Active" | "Inactive";

interface SeedUser {
  email: string;
  name: string;
  password: string;
  role: string;
  status: UserStatus;
}

export async function seedUsers(prisma: PrismaClient) {
  console.log("🌱 Seeding users...");

  const hashedPassword = await bcrypt.hash("password", 10);

  const roles = ["Admin", "User", "Editor", "Viewer"];
  const statuses: UserStatus[] = ["Active", "Inactive"];

  // Core users
  const userData: SeedUser[] = [
    {
      email: "admin@example.com",
      name: "Admin User",
      password: hashedPassword,
      role: "Admin",
      status: "Active",
    },
    {
      email: "owner@example.com",
      name: "Owner",
      password: hashedPassword,
      role: "Admin",
      status: "Active",
    },
  ];

  // Generate 20 additional random users
  const firstNames = [
    "James",
    "Mary",
    "Robert",
    "Patricia",
    "John",
    "Jennifer",
    "Michael",
    "Linda",
    "William",
    "Elizabeth",
    "David",
    "Barbara",
    "Richard",
    "Susan",
    "Joseph",
    "Jessica",
    "Thomas",
    "Sarah",
    "Christopher",
    "Karen",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Wilson",
    "Anderson",
    "Thomas",
    "Taylor",
    "Moore",
    "Jackson",
    "Martin",
  ];

  for (let i = 1; i <= 20; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;

    userData.push({
      email,
      name,
      password: hashedPassword,
      role: roles[Math.floor(Math.random() * roles.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });
  }

  const users = [];

  for (const u of userData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        password: u.password,
      },
      create: {
        email: u.email,
        name: u.name,
        password: u.password,
        role: u.role,
        status: u.status,
      },
    });
    users.push(user);
  }

  console.log(`✅ Created/Updated ${users.length} users`);
  return users;
}
