import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { publicUserSelect } from "../../config/constants";

export const usersRepository = {
  findMany() {
    return prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: publicUserSelect
    });
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: publicUserSelect
    });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      select: publicUserSelect
    });
  },

  update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      select: publicUserSelect
    });
  }
};
