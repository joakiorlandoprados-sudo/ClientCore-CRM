import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { publicUserSelect } from "../../config/constants";

export const clientInclude = {
  assignedTo: { select: publicUserSelect },
  _count: { select: { contacts: true, deals: true, notes: true, tasks: true } }
} satisfies Prisma.ClientInclude;

export const clientsRepository = {
  findMany(where: Prisma.ClientWhereInput, skip: number, take: number) {
    return prisma.$transaction([
      prisma.client.count({ where }),
      prisma.client.findMany({
        where,
        skip,
        take,
        include: clientInclude,
        orderBy: { createdAt: "desc" }
      })
    ]);
  },

  findById(id: string) {
    return prisma.client.findUnique({
      where: { id },
      include: clientInclude
    });
  },

  create(data: Prisma.ClientUncheckedCreateInput) {
    return prisma.client.create({
      data,
      include: clientInclude
    });
  },

  update(id: string, data: Prisma.ClientUncheckedUpdateInput) {
    return prisma.client.update({
      where: { id },
      data,
      include: clientInclude
    });
  },

  delete(id: string) {
    return prisma.client.delete({ where: { id } });
  },

  contacts(id: string) {
    return prisma.contact.findMany({ where: { clientId: id }, orderBy: { lastName: "asc" } });
  },

  deals(id: string) {
    return prisma.deal.findMany({
      where: { clientId: id },
      include: { assignedTo: { select: publicUserSelect }, client: true },
      orderBy: { createdAt: "desc" }
    });
  },

  notes(id: string) {
    return prisma.note.findMany({
      where: { clientId: id },
      include: { author: { select: publicUserSelect }, deal: true },
      orderBy: { createdAt: "desc" }
    });
  }
};
