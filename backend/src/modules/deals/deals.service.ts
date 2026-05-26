import { DealStage, Prisma, Role } from "@prisma/client";
import { dealStages } from "../../config/constants";
import { AuthenticatedUser, PageResult } from "../../types/api";
import { canViewAll } from "../../utils/access";
import { forbidden, notFound } from "../../utils/http-error";
import { getPagination, getQueryString } from "../../utils/query";
import { clientsService } from "../clients/clients.service";
import { CreateDealDto, MoveDealStageDto, UpdateDealDto } from "./deals.dtos";
import { dealsRepository } from "./deals.repository";

type DealListQuery = Record<string, unknown>;

function accessWhere(user: AuthenticatedUser): Prisma.DealWhereInput {
  return canViewAll(user) ? {} : { assignedToId: user.id };
}

export const dealsService = {
  async list(user: AuthenticatedUser, query: DealListQuery): Promise<PageResult<unknown>> {
    const { skip, take, page, limit } = getPagination(query);
    const where: Prisma.DealWhereInput = { ...accessWhere(user) };
    const stage = getQueryString(query.stage);
    const assignedTo = getQueryString(query.assignedTo);
    const clientId = getQueryString(query.clientId);

    if (stage && Object.values(DealStage).includes(stage as DealStage)) {
      where.stage = stage as DealStage;
    }
    if (assignedTo && canViewAll(user)) {
      where.assignedToId = assignedTo;
    }
    if (clientId) {
      where.clientId = clientId;
    }

    const [total, items] = await dealsRepository.findMany(where, skip, take);
    return { items, total, page, limit };
  },

  async get(user: AuthenticatedUser, id: string) {
    const deal = await dealsRepository.findById(id);
    if (!deal) {
      throw notFound("Deal not found");
    }
    if (!canViewAll(user) && deal.assignedToId !== user.id) {
      throw forbidden("You can only access your own deals");
    }
    return deal;
  },

  async create(user: AuthenticatedUser, dto: CreateDealDto) {
    await clientsService.get(user, dto.clientId);
    const assignedToId = canViewAll(user) ? dto.assignedToId ?? user.id : user.id;
    return dealsRepository.create({
      title: dto.title,
      value: dto.value,
      stage: dto.stage ?? DealStage.LEAD,
      clientId: dto.clientId,
      assignedToId,
      expectedCloseDate: new Date(dto.expectedCloseDate)
    });
  },

  async update(user: AuthenticatedUser, id: string, dto: UpdateDealDto) {
    await this.get(user, id);
    if (dto.clientId) {
      await clientsService.get(user, dto.clientId);
    }
    if (user.role === Role.SALES && dto.assignedToId && dto.assignedToId !== user.id) {
      throw forbidden("Sales users cannot reassign deals");
    }

    return dealsRepository.update(id, {
      title: dto.title,
      value: dto.value,
      stage: dto.stage,
      clientId: dto.clientId,
      assignedToId: user.role === Role.SALES ? undefined : dto.assignedToId,
      expectedCloseDate: dto.expectedCloseDate ? new Date(dto.expectedCloseDate) : undefined
    });
  },

  async moveStage(user: AuthenticatedUser, id: string, dto: MoveDealStageDto) {
    await this.get(user, id);
    return dealsRepository.update(id, { stage: dto.stage });
  },

  async delete(user: AuthenticatedUser, id: string) {
    await this.get(user, id);
    return dealsRepository.delete(id);
  },

  async aggregate(user: AuthenticatedUser) {
    const rows = await dealsRepository.aggregateByStage(accessWhere(user));
    return dealStages.map((stage) => {
      const row = rows.find((item) => item.stage === stage);
      return {
        stage,
        count: row?._count.id ?? 0,
        totalValue: Number(row?._sum.value ?? 0)
      };
    });
  }
};
