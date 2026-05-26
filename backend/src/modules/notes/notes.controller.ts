import { Request, Response } from "express";
import { sendSuccess } from "../../utils/api-response";
import { validateDto } from "../../utils/validation";
import { CreateNoteDto } from "./notes.dtos";
import { notesService } from "./notes.service";

export const notesController = {
  async list(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await notesService.list(req.user!, req.query));
  },

  async create(req: Request, res: Response): Promise<void> {
    const dto = await validateDto(CreateNoteDto, req.body);
    sendSuccess(res, await notesService.create(req.user!, dto), "Note created", 201);
  },

  async delete(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await notesService.delete(req.user!, req.params.id), "Note deleted");
  }
};
