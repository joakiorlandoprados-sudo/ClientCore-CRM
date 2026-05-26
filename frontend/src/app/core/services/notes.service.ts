import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";
import { Note } from "../models";

export interface NoteRequest {
  content: string;
  clientId?: string;
  dealId?: string;
}

@Injectable({ providedIn: "root" })
export class NotesService {
  private readonly api = inject(ApiService);

  list(query: { clientId?: string; dealId?: string }): Observable<Note[]> {
    return this.api.get<Note[]>("/notes", query);
  }

  create(body: NoteRequest): Observable<Note> {
    return this.api.post<Note, NoteRequest>("/notes", body);
  }

  delete(id: string): Observable<Note> {
    return this.api.delete<Note>(`/notes/${id}`);
  }
}
