export type Role = "ADMIN" | "MANAGER" | "SALES";
export type DealStage = "LEAD" | "QUALIFIED" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export const DEAL_STAGES: DealStage[] = ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];
export const TASK_STATUSES: TaskStatus[] = ["PENDING", "IN_PROGRESS", "DONE"];
export const TASK_PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH"];

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive?: boolean;
  createdAt?: string;
}

export interface AuthPayload {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Client {
  id: string;
  companyName: string;
  industry: string;
  website?: string | null;
  phone?: string | null;
  address?: string | null;
  assignedToId: string;
  assignedTo?: User;
  createdAt: string;
  _count?: {
    contacts: number;
    deals: number;
    notes: number;
    tasks: number;
  };
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  clientId: string;
  client?: Client;
}

export interface Deal {
  id: string;
  title: string;
  value: string | number;
  stage: DealStage;
  clientId: string;
  client?: Client;
  assignedToId: string;
  assignedTo?: User;
  expectedCloseDate: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedToId: string;
  assignedTo?: User;
  dealId?: string | null;
  deal?: Deal | null;
  clientId?: string | null;
  client?: Client | null;
  createdAt: string;
}

export interface Note {
  id: string;
  content: string;
  authorId: string;
  author?: User;
  clientId?: string | null;
  client?: Client | null;
  dealId?: string | null;
  deal?: Deal | null;
  createdAt: string;
}

export interface PipelineBucket {
  stage: DealStage;
  count: number;
  totalValue: number;
}

export interface DashboardSummary {
  totalClients: number;
  openDeals: number;
  tasksDueToday: number;
  revenueWonThisMonth: number;
}

export interface ActivityItem {
  id: string;
  type: "NOTE" | "TASK";
  title: string;
  createdAt: string;
  actor: string;
  client?: string;
  deal?: string;
}
