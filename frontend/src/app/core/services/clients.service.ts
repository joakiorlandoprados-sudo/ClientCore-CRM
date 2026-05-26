import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";
import { Client, Contact, Deal, Note, PageResult } from "../models";

export interface ClientRequest {
  companyName: string;
  industry: string;
  website?: string;
  phone?: string;
  address?: string;
  assignedToId?: string;
}

export interface ClientQuery {
  page?: number;
  limit?: number;
  search?: string;
  industry?: string;
  assignedTo?: string;
}

@Injectable({ providedIn: "root" })
export class ClientsService {
  private readonly api = inject(ApiService);

  list(query: ClientQuery = {}): Observable<PageResult<Client>> {
    return this.api.get<PageResult<Client>>("/clients", query);
  }

  get(id: string): Observable<Client> {
    return this.api.get<Client>(`/clients/${id}`);
  }

  create(body: ClientRequest): Observable<Client> {
    return this.api.post<Client, ClientRequest>("/clients", body);
  }

  update(id: string, body: Partial<ClientRequest>): Observable<Client> {
    return this.api.patch<Client, Partial<ClientRequest>>(`/clients/${id}`, body);
  }

  delete(id: string): Observable<Client> {
    return this.api.delete<Client>(`/clients/${id}`);
  }

  contacts(id: string): Observable<Contact[]> {
    return this.api.get<Contact[]>(`/clients/${id}/contacts`);
  }

  deals(id: string): Observable<Deal[]> {
    return this.api.get<Deal[]>(`/clients/${id}/deals`);
  }

  notes(id: string): Observable<Note[]> {
    return this.api.get<Note[]>(`/clients/${id}/notes`);
  }
}
