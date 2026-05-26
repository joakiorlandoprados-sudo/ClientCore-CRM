import { Prisma } from "@prisma/client";
import { AuthenticatedUser } from "../../types/api";
import { canViewAll } from "../../utils/access";
import { badRequest, forbidden, notFound } from "../../utils/http-error";
import { getQueryString } from "../../utils/query";
import { clientsService } from "../clients/clients.service";
import { dealsService } from "../deals/deals.service";
import { CreateNoteDto } from "./notes.dtos";
import { notesRepository } from "./notes.repository";

type NotesQuery = Record<string, unknown>;

async function assertNoteAccess(user: AuthenticatedUser, clientId?: string, dealId?: string): Promise<void> {
  if (clientId) {
    await clientsService.get(user, clientId);
  }
  if (dealId) {
    await dealsService.get(user, dealId);
  }
}

export const notesService = {
  async list(user: AuthenticatedUser, query: NotesQuery) {
    const clientId = getQueryString(query.clientId);
    const dealId = getQueryString(query.dealId);
    await assertNoteAccess(user, clientId, dealId);

    const where: Prisma.NoteWhereInput = {};
    if (clientId) {
      where.clientId = clientId;
    }
    if (dealId) {
      where.dealId = dealId;
    }
    if (!canViewAll(user)) {
      where.OR = [
        { client: { assignedToId: user.id } },
        { deal: { assignedToId: user.id } },
        { authorId: user.id }
      ];
    }
    return notesRepository.findMany(where);
  },

  async create(user: AuthenticatedUser, dto: CreateNoteDto) {
    if (!dto.clientId && !dto.dealId) {
      throw badRequest("A note must be linked to a client or a deal");
    }
    await assertNoteAccess(user, dto.clientId, dto.dealId);
    return notesRepository.create({
      content: dto.content,
      authorId: user.id,
      clientId: dto.clientId,
      dealId: dto.dealId
    });
  },

  async delete(user: AuthenticatedUser, id: string) {
    const note = await notesRepository.findById(id);
    if (!note) {
      throw notFound("Note not found");
    }
    if (!canViewAll(user) && note.authorId !== user.id) {
      throw forbidden("You can only delete your own notes");
    }
    return notesRepository.delete(id);
  }
};
