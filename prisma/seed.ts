import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import bcrypt from "bcryptjs";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  const password = await bcrypt.hash("password123", 10);

  // Company
  const company = await prisma.company.upsert({
    where: { slug: "asiacommerce" },
    update: {},
    create: {
      name: "PT AsiaCommerce",
      slug: "asiacommerce",
      email: "info@asiacommerce.net",
      phone: "021-1234567",
      address: "Jakarta, Indonesia",
    },
  });

  // Users (3 role)
  const [admin] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@asiacommerce.net" },
      update: {},
      create: {
        name: "Super Admin",
        email: "admin@asiacommerce.net",
        password,
        role: "SUPER_ADMIN",
        companyId: company.id,
      },
    }),
    prisma.user.upsert({
      where: { email: "manager@asiacommerce.net" },
      update: {},
      create: {
        name: "Asset Manager",
        email: "manager@asiacommerce.net",
        password,
        role: "ASSET_MANAGER",
        companyId: company.id,
      },
    }),
    prisma.user.upsert({
      where: { email: "handler@asiacommerce.net" },
      update: {},
      create: {
        name: "Asset Handler",
        email: "handler@asiacommerce.net",
        password,
        role: "ASSET_HANDLER",
        companyId: company.id,
      },
    }),
  ]);

  // Master data - kategori (findFirst + create karena parentId null)
  async function ensureCategory(name: string) {
    const found = await prisma.category.findFirst({
      where: { name, companyId: company.id, parentId: null },
    });
    if (found) return found;
    return prisma.category.create({ data: { name, companyId: company.id } });
  }

  const elektronik = await ensureCategory("Elektronik");
  const kendaraan = await ensureCategory("Kendaraan");
  const digital = await ensureCategory("Aset Digital");

  const [hq, gudang] = await Promise.all([
    prisma.location.upsert({
      where: { name_companyId: { name: "Kantor Pusat", companyId: company.id } },
      update: {},
      create: {
        name: "Kantor Pusat",
        address: "Jakarta",
        companyId: company.id,
      },
    }),
    prisma.location.upsert({
      where: { name_companyId: { name: "Gudang A", companyId: company.id } },
      update: {},
      create: { name: "Gudang A", address: "Bekasi", companyId: company.id },
    }),
  ]);

  const [dell, toyota] = await Promise.all([
    prisma.brand.upsert({
      where: { name_companyId: { name: "Dell", companyId: company.id } },
      update: {},
      create: { name: "Dell", companyId: company.id },
    }),
    prisma.brand.upsert({
      where: { name_companyId: { name: "Toyota", companyId: company.id } },
      update: {},
      create: { name: "Toyota", companyId: company.id },
    }),
  ]);

  const owner = await prisma.owner.upsert({
    where: { name_companyId: { name: "Divisi IT", companyId: company.id } },
    update: {},
    create: {
      name: "Divisi IT",
      department: "Teknologi Informasi",
      companyId: company.id,
    },
  });

  // Assets sample
  const year = new Date().getFullYear();
  const assetsData = [
    {
      systemCode: `AC-${year}-0001`,
      name: "Laptop Dell Latitude 5540",
      assetType: "PHYSICAL" as const,
      categoryId: elektronik.id,
      brandId: dell.id,
      locationId: hq.id,
      ownerId: owner.id,
      serialNumber: "DL5540-001",
      condition: "GOOD" as const,
      purchasePrice: 18000000,
      currentValue: 15000000,
      usefulLifeYears: 4,
      salvageValue: 2000000,
    },
    {
      systemCode: `AC-${year}-0002`,
      name: "Toyota Avanza 2022",
      assetType: "PHYSICAL" as const,
      categoryId: kendaraan.id,
      brandId: toyota.id,
      locationId: hq.id,
      ownerId: owner.id,
      serialNumber: "B-1234-XYZ",
      condition: "EXCELLENT" as const,
      purchasePrice: 250000000,
      currentValue: 210000000,
      usefulLifeYears: 8,
      salvageValue: 50000000,
    },
    {
      systemCode: `AC-${year}-0003`,
      name: "Domain asiacommerce.net",
      assetType: "DIGITAL" as const,
      categoryId: digital.id,
      ownerId: owner.id,
      domain: "asiacommerce.net",
      expiryDate: new Date(year + 1, 5, 1),
      purchasePrice: 500000,
      currentValue: 500000,
      status: "ACTIVE" as const,
    },
    {
      systemCode: `AC-${year}-0004`,
      name: "AC Daikin 1PK Ruang Meeting",
      assetType: "PHYSICAL" as const,
      categoryId: elektronik.id,
      locationId: gudang.id,
      condition: "FAIR" as const,
      status: "IN_MAINTENANCE" as const,
      purchasePrice: 4500000,
      currentValue: 3000000,
      usefulLifeYears: 5,
    },
  ];

  for (const data of assetsData) {
    await prisma.asset.upsert({
      where: { systemCode: data.systemCode },
      update: {},
      create: {
        ...data,
        companyId: company.id,
        createdById: admin.id,
        approvalStatus: "APPROVED",
      },
    });
  }

  // Maintenance sample
  const acAsset = await prisma.asset.findUnique({
    where: { systemCode: `AC-${year}-0004` },
  });
  if (acAsset) {
    const exists = await prisma.maintenance.findFirst({
      where: { assetId: acAsset.id },
    });
    if (!exists) {
      await prisma.maintenance.create({
        data: {
          assetId: acAsset.id,
          companyId: company.id,
          type: "PREVENTIVE",
          frequency: "QUARTERLY",
          title: "Servis rutin AC",
          scheduledDate: new Date(Date.now() + 7 * 86400000),
          status: "SCHEDULED",
          cost: 250000,
        },
      });
    }
  }

  console.log("✅ Seed selesai!");
  console.log("   Login: admin@asiacommerce.net / password123");
  console.log("          manager@asiacommerce.net / password123");
  console.log("          handler@asiacommerce.net / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
