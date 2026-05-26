import { Prisma } from "@prisma/client";
import { dealStages } from "../../config/constants";
import { AuthenticatedUser } from "../../types/api";
import { canViewAll } from "../../utils/access";
import { dashboardRepository } from "./dashboard.repository";

function dayRange(date = new Date()): { start: Date; end: Date } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

function monthRange(date = new Date()): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
}

function clientWhere(user: AuthenticatedUser): Prisma.ClientWhereInput {
  return canViewAll(user) ? {} : { assignedToId: user.id };
}

function dealWhere(user: AuthenticatedUser): Prisma.DealWhereInput {
  return canViewAll(user) ? {} : { assignedToId: user.id };
}

function taskWhere(user: AuthenticatedUser): Prisma.TaskWhereInput {
  return canViewAll(user) ? {} : { assignedToId: user.id };
}

function noteWhere(user: AuthenticatedUser): Prisma.NoteWhereInput {
  return canViewAll(user)
    ? {}
    : {
        OR: [
          { authorId: user.id },
          { client: { assignedToId: user.id } },
          { deal: { assignedToId: user.id } }
        ]
      };
}

export const dashboardService = {
  async summary(user: AuthenticatedUser) {
    const today = dayRange();
    const month = monthRange();
    const [totalClients, openDeals, tasksDueToday, revenue] = await Promise.all([
      dashboardRepository.countClients(clientWhere(user)),
      dashboardRepository.countOpenDeals(dealWhere(user)),
      dashboardRepository.countTasksDueToday(taskWhere(user), today.start, today.end),
      dashboardRepository.revenueWonThisMonth(dealWhere(user), month.start, month.end)
    ]);

    return {
      totalClients,
      openDeals,
      tasksDueToday,
      revenueWonThisMonth: Number(revenue._sum.value ?? 0)
    };
  },

  async pipeline(user: AuthenticatedUser) {
    const rows = await dashboardRepository.pipeline(dealWhere(user));
    return dealStages.map((stage) => {
      const row = rows.find((item) => item.stage === stage);
      return {
        stage,
        count: row?._count.id ?? 0,
        totalValue: Number(row?._sum.value ?? 0)
      };
    });
  },

  async activity(user: AuthenticatedUser) {
    const [notes, tasks] = await Promise.all([
      dashboardRepository.lastNotes(noteWhere(user)),
      dashboardRepository.lastTasks(taskWhere(user))
    ]);

    return [...notes.map((note) => ({
      id: note.id,
      type: "NOTE" as const,
      title: note.content.slice(0, 80),
      createdAt: note.createdAt,
      actor: note.author.name,
      client: note.client?.companyName,
      deal: note.deal?.title
    })), ...tasks.map((task) => ({
      id: task.id,
      type: "TASK" as const,
      title: task.title,
      createdAt: task.createdAt,
      actor: task.assignedTo.name,
      client: task.client?.companyName,
      deal: task.deal?.title
    }))]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);
  }
};
