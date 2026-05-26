import { DealStage, TaskPriority, TaskStatus, Role } from "@prisma/client";

export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true
} as const;

export const dealStages: DealStage[] = [
  DealStage.LEAD,
  DealStage.QUALIFIED,
  DealStage.PROPOSAL,
  DealStage.NEGOTIATION,
  DealStage.WON,
  DealStage.LOST
];

export const taskStatuses: TaskStatus[] = [
  TaskStatus.PENDING,
  TaskStatus.IN_PROGRESS,
  TaskStatus.DONE
];

export const taskPriorities: TaskPriority[] = [
  TaskPriority.LOW,
  TaskPriority.MEDIUM,
  TaskPriority.HIGH
];

export const adminRoles: Role[] = [Role.ADMIN];
export const elevatedRoles: Role[] = [Role.ADMIN, Role.MANAGER];
