import { faker } from "@faker-js/faker/locale/pt_BR";
import {
  PrismaClient,
  type RepairOrderServiceCategory,
  type RepairOrderServiceStatus,
  type RepairOrderServiceType,
  type RepairOrderStatus,
  type UserStatus,
  type UserType,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed do banco de dados...");
  
  // Clean up existing data
  console.log("Limpando dados existentes...");
  await prisma.$transaction([
    prisma.repairOrderService.deleteMany(),
    prisma.repairOrder.deleteMany(),
    prisma.repairOrderServiceItem.deleteMany(),
    prisma.user.deleteMany(),
    prisma.base.deleteMany(),
    prisma.baseAddress.deleteMany(),
  ]);
  console.log("Dados existentes removidos com sucesso.");

  // Create Base Addresses
  console.log("Criando endereços das bases...");
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
  console.log(`${baseAddresses.length} endereços criados com sucesso.`);

  // Create Bases
  console.log("Criando bases...");
  const bases = await Promise.all(
    baseAddresses.map(async (address) => {
      return prisma.base.create({
        data: {
          name: faker.company.name(),
          phone: faker.string.numeric("11"),
          addressId: address.id,
        },
      });
    }),
  );
  console.log(`${bases.length} bases criadas com sucesso.`);

  // Create Users
  console.log("Criando usuários...");
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
        },
      });
    }),
  );
  console.log(`${users.length} usuários criados com sucesso.`);

  // Create Repair Order Items
  console.log("Criando itens de serviço...");
  const RepairOrderServiceItem = await Promise.all(
    Array.from({ length: 30 }).map(async () => {
      return prisma.repairOrderServiceItem.create({
        data: {
          name: faker.commerce.productName(),
          value: Number.parseFloat(faker.commerce.price()),
          baseId: faker.helpers.arrayElement(bases).id,
        },
      });
    }),
  );
  console.log(`${RepairOrderServiceItem.length} itens de serviço criados com sucesso.`);

  // Create Repair Orders
  console.log("Criando ordens de reparo...");
  const repairOrders = await Promise.all(
    Array.from({ length: 15 }).map(async (_, index) => {
      const status = faker.helpers.arrayElement([
        "PENDING",
        "REVISION",
        "APPROVED",
        "PARTIALLY_APPROVED",
        "INVOICE_APPROVED",
        "CANCELLED",
      ]) as RepairOrderStatus;

      // Generate unique GCAF by using the index
      const gcaf = BigInt(Date.now() + index);
      
      // Selecionar aleatoriamente entre 1 e 3 usuários
      const selectedUsers = faker.helpers.arrayElements(
        users,
        faker.number.int({ min: 1, max: 3 })
      );

      return prisma.repairOrder.create({
        data: {
          gcaf,
          baseId: faker.helpers.arrayElement(bases).id,
          plate: faker.helpers.replaceSymbols("???####").toUpperCase(),
          kilometers: Number.parseInt(faker.string.numeric("6")),
          status,
          observations: faker.helpers.maybe(() => faker.lorem.paragraph()),
          discount: Number.parseFloat(faker.commerce.price()),
          users: {
            connect: selectedUsers.map(user => ({ id: user.id })),
          },
        },
      });
    }),
  );
  console.log(`${repairOrders.length} ordens de reparo criadas com sucesso.`);

  // Create Repair Order Services
  console.log("Criando serviços para as ordens de reparo...");
  let totalServices = 0;
  
  await Promise.all(
    repairOrders.map(async (repairOrder) => {
      const serviceCount = faker.number.int({ min: 1, max: 5 });
      totalServices += serviceCount;
      
      return Promise.all(
        Array.from({ length: serviceCount }).map(async () => {
          const type = faker.helpers.arrayElement(["PREVENTIVE", "CORRECTIVE", "HELP"]) as RepairOrderServiceType;
          const category = faker.helpers.arrayElement(["LABOR", "MATERIAL"]) as RepairOrderServiceCategory;
          const status = faker.helpers.arrayElement(["PENDING", "APPROVED", "CANCELLED"]) as RepairOrderServiceStatus;

          // Calcular duração em segundos (entre 30min e 8h)
          const durationInSeconds = faker.number.int({ min: 1800, max: 28800 });

          return prisma.repairOrderService.create({
            data: {
              itemId: faker.helpers.arrayElement(RepairOrderServiceItem).id,
              quantity: faker.number.int({ min: 1, max: 10 }),
              labor: faker.commerce.productDescription(),
              duration: BigInt(durationInSeconds), // 30min to 8h in seconds
              value: Number.parseFloat(faker.commerce.price()),
              discount: Number.parseFloat(faker.commerce.price({ max: 100 })),
              type,
              category,
              status,
              repairOrderId: repairOrder.id,
              photo: "", // Campo obrigatório conforme schema
            },
          });
        }),
      );
    }),
  );

  console.log(`${totalServices} serviços criados com sucesso.`);
  console.log("Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
