import { faker } from "@faker-js/faker/locale/pt_BR";
import {
  PrismaClient,
  type RepairOrderServiceStatus,
  type RepairOrderServiceType,
  type RepairOrderStatus,
  type UserStatus,
  type UserType,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.$transaction([
    prisma.repairOrderService.deleteMany(),
    prisma.repairOrder.deleteMany(),
    prisma.repairOrderItem.deleteMany(),
    prisma.truckModel.deleteMany(),
    prisma.user.deleteMany(),
    prisma.base.deleteMany(),
    prisma.baseAddress.deleteMany(),
  ]);

  // Create Base Addresses
  const baseAddresses = await Promise.all(
    Array.from({ length: 5 }).map(async () => {
      return prisma.baseAddress.create({
        data: {
          street: faker.location.street(),
          number: Number.parseInt(faker.location.buildingNumber()),
          complement: faker.location.secondaryAddress(),
          neighborhood: faker.location.county(),
          city: faker.location.city(),
          state: faker.location.state().substring(0, 2).toUpperCase(),
          zipCode: faker.location.zipCode("########"),
        },
      });
    }),
  );

  // Create Bases
  const bases = await Promise.all(
    baseAddresses.map(async (address) => {
      return prisma.base.create({
        data: {
          name: faker.company.name(),
          phone: faker.string.numeric('11'),
          addressId: address.id,
        },
      });
    }),
  );

  // Create Users
  const users = await Promise.all(
    Array.from({ length: 20 }).map(async () => {
      const userType = faker.helpers.arrayElement(["MECHANIC", "BUDGETIST"]) as UserType;
      const userStatus = faker.helpers.arrayElement(["APPROVED", "REPROVED", "PENDING"]) as UserStatus;

      return prisma.user.create({
        data: {
          name: faker.person.fullName(),
          cpf: faker.string.numeric("###########"),
          email: faker.internet.email(),
          password: faker.internet.password(),
          type: userType,
          status: userStatus,
          birthDate: faker.date.past(),
          assistant: faker.datatype.boolean(),
          observations: faker.helpers.maybe(() => faker.lorem.paragraph()),
          bases: {
            connect: [{ id: faker.helpers.arrayElement(bases).id }],
          },
        },
      });
    }),
  );

  // Create Truck Models
  const truckModels = await Promise.all(
    Array.from({ length: 10 }).map(async () => {
      return prisma.truckModel.create({
        data: {
          name: faker.vehicle.model(),
          brand: faker.vehicle.manufacturer(),
          year: Number.parseInt(faker.date.past().getFullYear().toString()),
        },
      });
    }),
  );

  // Create Repair Order Items
  const repairOrderItems = await Promise.all(
    Array.from({ length: 30 }).map(async () => {
      return prisma.repairOrderItem.create({
        data: {
          name: faker.commerce.productName(),
          truckModelId: faker.helpers.arrayElement(truckModels).id,
          value: Number.parseFloat(faker.commerce.price()),
          baseId: faker.helpers.arrayElement(bases).id,
        },
      });
    }),
  );

  // Create Repair Orders
  const repairOrders = await Promise.all(
    Array.from({ length: 15 }).map(async (_, index) => {
      const status = faker.helpers.arrayElement([
        'PENDING',
        'REVISION',
        'APPROVED',
        'PARTIALLY_APPROVED',
        'INVOICE_APPROVED',
        'CANCELLED',
      ]) as RepairOrderStatus;

      // Generate unique GCAF by using the index
      const gcaf = BigInt(Date.now() + index);

      return prisma.repairOrder.create({
        data: {
          gcaf,
          baseId: faker.helpers.arrayElement(bases).id,
          plate: faker.helpers.replaceSymbols('???####').toUpperCase(),
          kilometers: Number.parseInt(faker.string.numeric('6')),
          status,
          observations: faker.helpers.maybe(() => faker.lorem.paragraph()),
          discount: Number.parseFloat(faker.commerce.price()),
          users: {
            connect: [{ id: faker.helpers.arrayElement(users).id }],
          },
        },
      });
    }),
  );

  // Create Repair Order Services
  await Promise.all(
    repairOrders.map(async (repairOrder) => {
      return Promise.all(
        Array.from({ length: faker.number.int({ min: 1, max: 5 }) }).map(async () => {
          const type = faker.helpers.arrayElement(["PREVENTIVE", "CORRECTIVE"]) as RepairOrderServiceType;
          const status = faker.helpers.arrayElement(["PENDING", "APPROVED", "CANCELLED"]) as RepairOrderServiceStatus;

          return prisma.repairOrderService.create({
            data: {
              itemId: faker.helpers.arrayElement(repairOrderItems).id,
              quantity: faker.number.int({ min: 1, max: 10 }),
              labor: faker.commerce.productDescription(),
              duration: BigInt(faker.number.int({ min: 1800, max: 28800 })), // 30min to 8h in seconds
              value: Number.parseFloat(faker.commerce.price()),
              discount: Number.parseFloat(faker.commerce.price({ max: 100 })),
              type,
              status,
              repairOrderId: repairOrder.id,
            },
          });
        }),
      );
    }),
  );

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
