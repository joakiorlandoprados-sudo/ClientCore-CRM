import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { publicUserSelect } from "../../config/constants";

export const noteInclude = {
  author: { select: publicUserSelect },
  client: true,
  deal: true
} satisfies Prisma.NoteInclude;

export const notesRepository = {
  findMany(where: Prisma.NoteWhereInput) {
    return prisma.note.findMany({
      where,
      include: noteInclude,
      orderBy: { createdAt: "desc" }
    });
  },

  findById(id: string) {
    return prisma.note.findUnique({ where: { id }, include: noteInclude });
  },

  create(data: Prisma.NoteUncheckedCreateInput) {
    return prisma.note.create({ data, include: noteInclude });
  },

  delete(id: string) {
    return prisma.note.delete({ where: { id } });
  }
};
