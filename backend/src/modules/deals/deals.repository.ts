import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { publicUserSelect } from "../../config/constants";

export const dealInclude = {
  client: true,
  assignedTo: { select: publicUserSelect },
  _count: { select: { tasks: true, notes: true } }
} satisfies Prisma.DealInclude;

export const dealsRepository = {
  findMany(where: Prisma.DealWhereInput, skip: number, take: number) {
    return prisma.$transaction([
      prisma.deal.count({ where }),
      prisma.deal.findMany({
        where,
        skip,
        take,
        include: dealInclude,
        orderBy: { expectedCloseDate: "asc" }
      })
    ]);
  },

  findById(id: string) {
    return prisma.deal.findUnique({ where: { id }, include: dealInclude });
  },

  create(data: Prisma.DealUncheckedCreateInput) {
    return prisma.deal.create({ data, include: dealInclude });
  },

  update(id: string, data: Prisma.DealUncheckedUpdateInput) {
    return prisma.deal.update({ where: { id }, data, include: dealInclude });
  },

  delete(id: string) {
    return prisma.deal.delete({ where: { id } });
  },

  aggregateByStage(where: Prisma.DealWhereInput) {
    return prisma.deal.groupBy({
      by: ["stage"],
      where,
      _sum: { value: true },
      _count: { id: true }
    });
  }
};
