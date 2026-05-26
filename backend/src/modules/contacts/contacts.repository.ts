import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const contactsRepository = {
  findMany(where: Prisma.ContactWhereInput) {
    return prisma.contact.findMany({
      where,
      include: { client: true },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }]
    });
  },

  findById(id: string) {
    return prisma.contact.findUnique({ where: { id }, include: { client: true } });
  },

  create(data: Prisma.ContactUncheckedCreateInput) {
    return prisma.contact.create({ data, include: { client: true } });
  },

  update(id: string, data: Prisma.ContactUncheckedUpdateInput) {
    return prisma.contact.update({ where: { id }, data, include: { client: true } });
  },

  delete(id: string) {
    return prisma.contact.delete({ where: { id } });
  }
};
