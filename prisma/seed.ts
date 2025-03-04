import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data to prevent conflicts
  await prisma.repairOrderService.deleteMany();
  await prisma.repairOrderItem.deleteMany();
  await prisma.repairOrder.deleteMany();
  await prisma.baseAddress.deleteMany();
  await prisma.base.deleteMany();
  await prisma.truckModel.deleteMany();
  await prisma.user.deleteMany();

  // Seed BaseAddresses
  const baseAddresses = await prisma.baseAddress.createMany({
    data: [
      {
        street: "Av. Industrial",
        number: 1500,
        neighborhood: "Distrito Industrial",
        city: "São Paulo",
        state: "SP",
        zipCode: "08090970",
      },
      {
        street: "Rodovia Santos Dumont",
        number: 3500,
        neighborhood: "Área Industrial",
        city: "Campinas",
        state: "SP",
        zipCode: "13054970",
      },
    ],
  });

  // Fetch the created base addresses
  const createdBaseAddresses = await prisma.baseAddress.findMany();

  // Seed Bases
  const bases = await Promise.all(
    createdBaseAddresses.map((address) =>
      prisma.base.create({
        data: {
          name: `Base ${address.city}`,
          phone: "1199999999",
          addressId: address.id,
        },
      }),
    ),
  );

  // Seed Truck Models
  const truckModels = await prisma.truckModel.createMany({
    data: [
      { name: "Actros", brand: "Mercedes-Benz", year: 2020 },
      { name: "Scania R", brand: "Scania", year: 2019 },
      { name: "Volvo FH", brand: "Volvo", year: 2021 },
    ],
  });

  // Fetch created truck models
  const createdTruckModels = await prisma.truckModel.findMany();

  // Seed Users
  const users = await prisma.user.createMany({
    data: [
      {
        name: "João Silva",
        cpf: "12345678901",
        email: "joao.silva@example.com",
        password: "hashedpassword123", // In real-world, use proper hashing
        type: "MECHANIC",
        status: "APPROVED",
        birthDate: new Date("1990-01-15"),
        assistant: false,
      },
      {
        name: "Maria Santos",
        cpf: "98765432109",
        email: "maria.santos@example.com",
        password: "hashedpassword456", // In real-world, use proper hashing
        type: "BUDGETIST",
        status: "APPROVED",
        birthDate: new Date("1985-05-20"),
        assistant: true,
      },
    ],
  });

  // Fetch created users
  const createdUsers = await prisma.user.findMany();

  // Seed Repair Order Items
  const repairOrderItems = await Promise.all(
    createdTruckModels.map((model) =>
      prisma.repairOrderItem.create({
        data: {
          name: `Repair Item for ${model.name}`,
          truckModelId: model.id,
          value: 500.0,
          baseId: bases[0].id,
        },
      }),
    ),
  );

  // Seed Repair Orders
  const repairOrders = await prisma.repairOrder.createMany({
    data: [
      {
        gcaf: BigInt(Math.floor(Math.random() * 1000000)),
        baseId: bases[0].id,
        plate: "ABC1234",
        kilometers: 150000,
        status: "PENDING",
        discount: 0,
      },
      {
        gcaf: BigInt(Math.floor(Math.random() * 1000000)),
        baseId: bases[1].id,
        plate: "DEF5678",
        kilometers: 200000,
        status: "REVISION",
        discount: 50.0,
      },
    ],
  });

  // Fetch created repair orders
  const createdRepairOrders = await prisma.repairOrder.findMany();

  // Seed Repair Order Services
  await prisma.repairOrderService.createMany({
    data: [
      {
        itemId: repairOrderItems[0].id,
        quantity: 2,
        labor: "Engine Maintenance",
        duration: BigInt(120),
        value: 1000.0,
        discount: 50.0,
        type: "PREVENTIVE",
        status: "PENDING",
        repairOrderId: createdRepairOrders[0].id,
      },
      {
        itemId: repairOrderItems[1].id,
        quantity: 1,
        labor: "Brake System Repair",
        duration: BigInt(180),
        value: 1500.0,
        discount: 0,
        type: "CORRECTIVE",
        status: "APPROVED",
        repairOrderId: createdRepairOrders[1].id,
      },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export default main;
