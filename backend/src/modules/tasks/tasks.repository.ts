import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { publicUserSelect } from "../../config/constants";

export const taskInclude = {
  assignedTo: { select: publicUserSelect },
  client: true,
  deal: true
} satisfies Prisma.TaskInclude;

export const tasksRepository = {
  findMany(where: Prisma.TaskWhereInput, skip: number, take: number) {
    return prisma.$transaction([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        skip,
        take,
        include: taskInclude,
        orderBy: [{ dueDate: "asc" }, { priority: "desc" }]
      })
    ]);
  },

  findById(id: string) {
    return prisma.task.findUnique({ where: { id }, include: taskInclude });
  },

  create(data: Prisma.TaskUncheckedCreateInput) {
    return prisma.task.create({ data, include: taskInclude });
  },

  update(id: string, data: Prisma.TaskUncheckedUpdateInput) {
    return prisma.task.update({ where: { id }, data, include: taskInclude });
  },

  delete(id: string) {
    return prisma.task.delete({ where: { id } });
  }
};
