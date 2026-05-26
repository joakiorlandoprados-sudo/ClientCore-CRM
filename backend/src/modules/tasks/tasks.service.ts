import { Prisma, Role, TaskPriority, TaskStatus } from "@prisma/client";
import { AuthenticatedUser, PageResult } from "../../types/api";
import { canViewAll } from "../../utils/access";
import { forbidden, notFound } from "../../utils/http-error";
import { getPagination, getQueryString } from "../../utils/query";
import { clientsService } from "../clients/clients.service";
import { dealsService } from "../deals/deals.service";
import { CreateTaskDto, UpdateTaskDto } from "./tasks.dtos";
import { tasksRepository } from "./tasks.repository";

type TaskListQuery = Record<string, unknown>;

function accessWhere(user: AuthenticatedUser): Prisma.TaskWhereInput {
  return canViewAll(user) ? {} : { assignedToId: user.id };
}

function dueDateRange(dateText: string): { gte: Date; lt: Date } {
  const start = new Date(dateText);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { gte: start, lt: end };
}

async function assertRelations(user: AuthenticatedUser, clientId?: string, dealId?: string): Promise<void> {
  if (clientId) {
    await clientsService.get(user, clientId);
  }
  if (dealId) {
    await dealsService.get(user, dealId);
  }
}

export const tasksService = {
  async list(user: AuthenticatedUser, query: TaskListQuery): Promise<PageResult<unknown>> {
    const { skip, take, page, limit } = getPagination(query);
    const where: Prisma.TaskWhereInput = { ...accessWhere(user) };
    const status = getQueryString(query.status);
    const priority = getQueryString(query.priority);
    const assignedTo = getQueryString(query.assignedTo);
    const dueDate = getQueryString(query.dueDate);

    if (status && Object.values(TaskStatus).includes(status as TaskStatus)) {
      where.status = status as TaskStatus;
    }
    if (priority && Object.values(TaskPriority).includes(priority as TaskPriority)) {
      where.priority = priority as TaskPriority;
    }
    if (assignedTo && canViewAll(user)) {
      where.assignedToId = assignedTo;
    }
    if (dueDate) {
      where.dueDate = dueDateRange(dueDate);
    }

    const [total, items] = await tasksRepository.findMany(where, skip, take);
    return { items, total, page, limit };
  },

  async get(user: AuthenticatedUser, id: string) {
    const task = await tasksRepository.findById(id);
    if (!task) {
      throw notFound("Task not found");
    }
    if (!canViewAll(user) && task.assignedToId !== user.id) {
      throw forbidden("You can only access your own tasks");
    }
    return task;
  },

  async create(user: AuthenticatedUser, dto: CreateTaskDto) {
    await assertRelations(user, dto.clientId, dto.dealId);
    const assignedToId = canViewAll(user) ? dto.assignedToId ?? user.id : user.id;
    return tasksRepository.create({
      title: dto.title,
      description: dto.description,
      dueDate: new Date(dto.dueDate),
      status: dto.status ?? TaskStatus.PENDING,
      priority: dto.priority ?? TaskPriority.MEDIUM,
      assignedToId,
      clientId: dto.clientId,
      dealId: dto.dealId
    });
  },

  async update(user: AuthenticatedUser, id: string, dto: UpdateTaskDto) {
    await this.get(user, id);
    await assertRelations(user, dto.clientId, dto.dealId);
    if (user.role === Role.SALES && dto.assignedToId && dto.assignedToId !== user.id) {
      throw forbidden("Sales users cannot reassign tasks");
    }

    return tasksRepository.update(id, {
      title: dto.title,
      description: dto.description,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      status: dto.status,
      priority: dto.priority,
      assignedToId: user.role === Role.SALES ? undefined : dto.assignedToId,
      clientId: dto.clientId,
      dealId: dto.dealId
    });
  },

  async complete(user: AuthenticatedUser, id: string) {
    await this.get(user, id);
    return tasksRepository.update(id, { status: TaskStatus.DONE });
  },

  async delete(user: AuthenticatedUser, id: string) {
    await this.get(user, id);
    return tasksRepository.delete(id);
  }
};
