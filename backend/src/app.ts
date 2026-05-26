import "reflect-metadata";
import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { authenticate } from "./middlewares/authenticate";
import { errorHandler } from "./middlewares/error-handler";
import { notFoundHandler } from "./middlewares/not-found";
import { authRouter } from "./modules/auth/auth.routes";
import { usersRouter } from "./modules/users/users.routes";
import { clientsRouter } from "./modules/clients/clients.routes";
import { contactsRouter } from "./modules/contacts/contacts.routes";
import { dealsRouter } from "./modules/deals/deals.routes";
import { tasksRouter } from "./modules/tasks/tasks.routes";
import { notesRouter } from "./modules/notes/notes.routes";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes";

export const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/auth", authRouter);
app.use("/api/users", authenticate, usersRouter);
app.use("/api/clients", authenticate, clientsRouter);
app.use("/api/contacts", authenticate, contactsRouter);
app.use("/api/deals", authenticate, dealsRouter);
app.use("/api/tasks", authenticate, tasksRouter);
app.use("/api/notes", authenticate, notesRouter);
app.use("/api/dashboard", authenticate, dashboardRouter);

app.use(notFoundHandler);
app.use(errorHandler);
