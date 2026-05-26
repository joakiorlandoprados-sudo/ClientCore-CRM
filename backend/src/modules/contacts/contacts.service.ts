import { Prisma } from "@prisma/client";
import { AuthenticatedUser } from "../../types/api";
import { canViewAll } from "../../utils/access";
import { notFound } from "../../utils/http-error";
import { clientsService } from "../clients/clients.service";
import { CreateContactDto, UpdateContactDto } from "./contacts.dtos";
import { contactsRepository } from "./contacts.repository";

export const contactsService = {
  list(user: AuthenticatedUser) {
    const where: Prisma.ContactWhereInput = canViewAll(user) ? {} : { client: { assignedToId: user.id } };
    return contactsRepository.findMany(where);
  },

  async get(user: AuthenticatedUser, id: string) {
    const contact = await contactsRepository.findById(id);
    if (!contact) {
      throw notFound("Contact not found");
    }
    await clientsService.get(user, contact.clientId);
    return contact;
  },

  async create(user: AuthenticatedUser, dto: CreateContactDto) {
    await clientsService.get(user, dto.clientId);
    return contactsRepository.create(dto);
  },

  async update(user: AuthenticatedUser, id: string, dto: UpdateContactDto) {
    await this.get(user, id);
    if (dto.clientId) {
      await clientsService.get(user, dto.clientId);
    }
    return contactsRepository.update(id, dto);
  },

  async delete(user: AuthenticatedUser, id: string) {
    await this.get(user, id);
    return contactsRepository.delete(id);
  }
};
