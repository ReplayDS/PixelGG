import { PrismaClient } from "@prisma/client";
import { cloneInitialSiteData } from "../src/defaultSiteData.js";

const prisma = new PrismaClient();

async function main() {
  const initialData = cloneInitialSiteData();

  await prisma.siteConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      data: initialData,
    },
  });

  // eslint-disable-next-line no-console
  console.log("Seed finalizado: SiteConfig(id=1) pronto.");
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
