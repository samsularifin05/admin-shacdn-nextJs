import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Checking prisma models...");

  // Check if tm_banks is accessible
  // @ts-ignore
  if (prisma.tm_banks) {
    console.log("✅ prisma.tm_banks is defined.");
    try {
      // @ts-ignore
      const count = await prisma.tm_banks.count();
      console.log(`✅ Connection successful. Count: ${count}`);
    } catch (e) {
      console.error("❌ Failed to query:", e);
    }
  } else {
    console.error("❌ prisma.tm_banks is UNDEFINED.");
    // Try to list properties (might be internal)
    console.log("Prisma keys:", Object.getOwnPropertyNames(prisma));
  }
}

main().catch(console.error);
