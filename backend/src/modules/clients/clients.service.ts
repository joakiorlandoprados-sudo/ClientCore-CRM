import { Prisma, Role } from "@prisma/client";
import { AuthenticatedUser, PageResult } from "../../types/api";
import { canViewAll } from "../../utils/access";
import { forbidden, notFound } from "../../utils/http-error";
import { getPagination, getQueryString } from "../../utils/query";
import { CreateClientDto, UpdateClientDto } from "./clients.dtos";
import { clientsRepository } from "./clients.repository";

type ClientListQuery = Record<string, unknown>;

function buildClientAccessWhere(user: AuthenticatedUser): Prisma.ClientWhereInput {
  return canViewAll(user) ? {} : { assignedToId: user.id };
}

export const clientsService = {
  async list(user: AuthenticatedUser, query: ClientListQuery): Promise<PageResult<unknown>> {
    const { skip, take, page, limit } = getPagination(query);
    const where: Prisma.ClientWhereInput = {
      ...buildClientAccessWhere(user)
    };

    const industry = getQueryString(query.industry);
    const assignedTo = getQueryString(query.assignedTo);
    const search = getQueryString(query.search);

    if (industry) {
      where.industry = { contains: industry, mode: "insensitive" };
    }
    if (assignedTo && canViewAll(user)) {
      where.assignedToId = assignedTo;
    }
    if (search) {
      where.companyName = { contains: search, mode: "insensitive" };
    }

    const [total, items] = await clientsRepository.findMany(where, skip, take);
    return { items, total, page, limit };
  },

  async get(user: AuthenticatedUser, id: string) {
    const client = await clientsRepository.findById(id);
    if (!client) {
      throw notFound("Client not found");
    }
    if (!canViewAll(user) && client.assignedToId !== user.id) {
      throw forbidden("You can only access your own clients");
    }
    return client;
  },

  async create(user: AuthenticatedUser, dto: CreateClientDto) {
    const assignedToId = canViewAll(user) ? dto.assignedToId ?? user.id : user.id;
    return clientsRepository.create({
      companyName: dto.companyName,
      industry: dto.industry,
      website: dto.website,
      phone: dto.phone,
      address: dto.address,
      assignedToId
    });
  },

  async update(user: AuthenticatedUser, id: string, dto: UpdateClientDto) {
    await this.get(user, id);
    if (!canViewAll(user) && dto.assignedToId && dto.assignedToId !== user.id) {
      throw forbidden("Sales users cannot reassign clients");
    }
    return clientsRepository.update(id, {
      companyName: dto.companyName,
      industry: dto.industry,
      website: dto.website,
      phone: dto.phone,
      address: dto.address,
      assignedToId: user.role === Role.SALES ? undefined : dto.assignedToId
    });
  },

  async delete(user: AuthenticatedUser, id: string) {
    await this.get(user, id);
    return clientsRepository.delete(id);
  },

  async contacts(user: AuthenticatedUser, id: string) {
    await this.get(user, id);
    return clientsRepository.contacts(id);
  },

  async deals(user: AuthenticatedUser, id: string) {
    await this.get(user, id);
    return clientsRepository.deals(id);
  },

  async notes(user: AuthenticatedUser, id: string) {
    await this.get(user, id);
    return clientsRepository.notes(id);
  }
};
