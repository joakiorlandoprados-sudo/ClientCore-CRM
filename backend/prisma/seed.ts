import bcrypt from "bcrypt";
import { DealStage, PrismaClient, Role, TaskPriority, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

function addDays(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function main(): Promise<void> {
  await prisma.refreshToken.deleteMany();
  await prisma.note.deleteMany();
  await prisma.task.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 12);
  const users = await Promise.all([
    prisma.user.create({ data: { name: "Alicia Admin", email: "admin@clientcore.dev", passwordHash, role: Role.ADMIN } }),
    prisma.user.create({ data: { name: "Marco Manager", email: "manager1@clientcore.dev", passwordHash, role: Role.MANAGER } }),
    prisma.user.create({ data: { name: "Nora Manager", email: "manager2@clientcore.dev", passwordHash, role: Role.MANAGER } }),
    prisma.user.create({ data: { name: "Sofia Sales", email: "sales1@clientcore.dev", passwordHash, role: Role.SALES } }),
    prisma.user.create({ data: { name: "Leo Sales", email: "sales2@clientcore.dev", passwordHash, role: Role.SALES } }),
    prisma.user.create({ data: { name: "Mina Sales", email: "sales3@clientcore.dev", passwordHash, role: Role.SALES } })
  ]);

  const salesUsers = users.filter((user) => user.role === Role.SALES);
  const clientInputs = [
    ["Northstar Analytics", "SaaS", "https://northstar.example", "+1 555 0101", "120 Market St, San Francisco"],
    ["Blue Harbor Logistics", "Logistics", "https://blueharbor.example", "+1 555 0102", "44 Pier Ave, Seattle"],
    ["Evergreen Health", "Healthcare", "https://evergreen.example", "+1 555 0103", "9 Wellness Dr, Boston"],
    ["Atlas Retail Group", "Retail", "https://atlasretail.example", "+1 555 0104", "300 Commerce Blvd, Chicago"],
    ["Quantum Finance", "Fintech", "https://quantum.example", "+1 555 0105", "18 Exchange Pl, New York"],
    ["Sunrise Foods", "Food", "https://sunrisefoods.example", "+1 555 0106", "73 Harvest Ln, Austin"],
    ["Cobalt Energy", "Energy", "https://cobaltenergy.example", "+1 555 0107", "12 Grid Way, Denver"],
    ["Nova Education", "Education", "https://novaedu.example", "+1 555 0108", "510 Campus Rd, Raleigh"],
    ["Vertex Manufacturing", "Manufacturing", "https://vertexmfg.example", "+1 555 0109", "88 Foundry Pkwy, Detroit"],
    ["Lumen Media", "Media", "https://lumenmedia.example", "+1 555 0110", "25 Studio Ct, Los Angeles"]
  ] as const;

  const clients = await Promise.all(
    clientInputs.map(([companyName, industry, website, phone, address], index) =>
      prisma.client.create({
        data: {
          companyName,
          industry,
          website,
          phone,
          address,
          assignedToId: salesUsers[index % salesUsers.length].id,
          contacts: {
            create: [
              {
                firstName: ["Iris", "Caleb", "Priya", "Mateo", "Elena"][index % 5],
                lastName: ["Stone", "Rivera", "Shah", "Martin", "Kim"][index % 5],
                email: `primary${index + 1}@${companyName.toLowerCase().replaceAll(" ", "")}.example`,
                phone,
                position: "Decision Maker"
              },
              {
                firstName: ["Owen", "Lara", "Noah", "Maya", "Theo"][index % 5],
                lastName: ["Brooks", "Chen", "Diaz", "Singh", "Reed"][index % 5],
                email: `ops${index + 1}@${companyName.toLowerCase().replaceAll(" ", "")}.example`,
                phone,
                position: "Operations Lead"
              }
            ]
          }
        }
      })
    )
  );

  const stages = [
    DealStage.LEAD,
    DealStage.QUALIFIED,
    DealStage.PROPOSAL,
    DealStage.NEGOTIATION,
    DealStage.WON,
    DealStage.LOST
  ];

  const deals = await Promise.all(
    Array.from({ length: 15 }, (_, index) =>
      prisma.deal.create({
        data: {
          title: `${clientInputs[index % clientInputs.length][0]} expansion ${index + 1}`,
          value: 9000 + index * 3750,
          stage: stages[index % stages.length],
          clientId: clients[index % clients.length].id,
          assignedToId: salesUsers[index % salesUsers.length].id,
          expectedCloseDate: addDays(index * 6 - 18)
        }
      })
    )
  );

  await Promise.all(
    Array.from({ length: 20 }, (_, index) =>
      prisma.task.create({
        data: {
          title: [
            "Schedule discovery call",
            "Send proposal follow-up",
            "Review procurement notes",
            "Prepare renewal summary",
            "Confirm stakeholder list"
          ][index % 5],
          description: `CRM follow-up task ${index + 1}`,
          dueDate: addDays((index % 9) - 3),
          status: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.DONE][index % 3],
          priority: [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH][index % 3],
          assignedToId: salesUsers[index % salesUsers.length].id,
          clientId: clients[index % clients.length].id,
          dealId: deals[index % deals.length].id
        }
      })
    )
  );

  await Promise.all(
    Array.from({ length: 10 }, (_, index) =>
      prisma.note.create({
        data: {
          content: [
            "Interested in a phased rollout after budget approval.",
            "Procurement asked for security documentation.",
            "Champion wants executive dashboard examples.",
            "Competitor mentioned during pricing conversation.",
            "Follow up after internal roadmap review."
          ][index % 5],
          authorId: users[index % users.length].id,
          clientId: clients[index % clients.length].id,
          dealId: deals[index % deals.length].id
        }
      })
    )
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("ClientCore seed completed");
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
