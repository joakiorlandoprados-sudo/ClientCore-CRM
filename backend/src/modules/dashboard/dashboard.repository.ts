import { DealStage, Prisma, TaskStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { publicUserSelect } from "../../config/constants";

export const dashboardRepository = {
  countClients(where: Prisma.ClientWhereInput) {
    return prisma.client.count({ where });
  },

  countOpenDeals(where: Prisma.DealWhereInput) {
    return prisma.deal.count({
      where: {
        ...where,
        stage: { notIn: [DealStage.WON, DealStage.LOST] }
      }
    });
  },

  countTasksDueToday(where: Prisma.TaskWhereInput, start: Date, end: Date) {
    return prisma.task.count({
      where: {
        ...where,
        status: { not: TaskStatus.DONE },
        dueDate: { gte: start, lt: end }
      }
    });
  },

  revenueWonThisMonth(where: Prisma.DealWhereInput, start: Date, end: Date) {
    return prisma.deal.aggregate({
      where: {
        ...where,
        stage: DealStage.WON,
        expectedCloseDate: { gte: start, lt: end }
      },
      _sum: { value: true }
    });
  },

  pipeline(where: Prisma.DealWhereInput) {
    return prisma.deal.groupBy({
      by: ["stage"],
      where,
      _sum: { value: true },
      _count: { id: true }
    });
  },

  lastNotes(where: Prisma.NoteWhereInput) {
    return prisma.note.findMany({
      where,
      include: {
        author: { select: publicUserSelect },
        client: true,
        deal: true
      },
      orderBy: { createdAt: "desc" },
      take: 10
    });
  },

  lastTasks(where: Prisma.TaskWhereInput) {
    return prisma.task.findMany({
      where,
      include: {
        assignedTo: { select: publicUserSelect },
        client: true,
        deal: true
      },
      orderBy: { createdAt: "desc" },
      take: 10
    });
  }
};
