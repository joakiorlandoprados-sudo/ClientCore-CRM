import { CommonModule, CurrencyPipe, DatePipe } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { forkJoin, finalize } from "rxjs";
import { Client, Contact, Deal, Note } from "../../core/models";
import { ClientsService } from "../../core/services/clients.service";
import { NotesService } from "../../core/services/notes.service";
import { StatusPanelComponent } from "../../shared/status-panel.component";

type ClientTab = "Info" | "Contacts" | "Deals" | "Notes";

@Component({
  selector: "cc-client-detail",
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, ReactiveFormsModule, RouterLink, StatusPanelComponent],
  template: `
    @if (loading()) {
      <cc-status-panel title="Loading client" message="Fetching account workspace." />
    } @else if (!client()) {
      <cc-status-panel title="Client not found" message="The account could not be loaded." />
    } @else {
      <div class="page-header">
        <div>
          <h1>{{ client()!.companyName }}</h1>
          <p>{{ client()!.industry }} · {{ client()!.assignedTo?.name }}</p>
        </div>
        <a class="button" [routerLink]="['/clients', client()!.id, 'edit']"><span aria-hidden="true">✎</span> Edit</a>
      </div>

      <section class="panel">
        <div class="tabs">
          @for (item of tabs; track item) {
            <button type="button" [class.active]="tab() === item" (click)="tab.set(item)">{{ item }}</button>
          }
        </div>

        @if (tab() === "Info") {
          <div class="form-grid">
            <p><strong>Website</strong><br>{{ client()!.website || "—" }}</p>
            <p><strong>Phone</strong><br>{{ client()!.phone || "—" }}</p>
            <p class="full"><strong>Address</strong><br>{{ client()!.address || "—" }}</p>
          </div>
        }

        @if (tab() === "Contacts") {
          @if (contacts().length === 0) {
            <cc-status-panel title="No contacts" message="Contacts linked to this client will appear here." compact />
          } @else {
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Position</th></tr></thead>
              <tbody>
                @for (contact of contacts(); track contact.id) {
                  <tr>
                    <td>{{ contact.firstName }} {{ contact.lastName }}</td>
                    <td>{{ contact.email || "—" }}</td>
                    <td>{{ contact.phone || "—" }}</td>
                    <td>{{ contact.position || "—" }}</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        }

        @if (tab() === "Deals") {
          @if (deals().length === 0) {
            <cc-status-panel title="No deals" message="Pipeline opportunities linked to this client will appear here." compact />
          } @else {
            <table>
              <thead><tr><th>Deal</th><th>Stage</th><th>Value</th><th>Close date</th></tr></thead>
              <tbody>
                @for (deal of deals(); track deal.id) {
                  <tr>
                    <td>{{ deal.title }}</td>
                    <td><span class="badge">{{ deal.stage }}</span></td>
                    <td>{{ +deal.value | currency }}</td>
                    <td>{{ deal.expectedCloseDate | date: "MMM d, y" }}</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        }

        @if (tab() === "Notes") {
          <form class="toolbar" [formGroup]="noteForm" (ngSubmit)="addNote()">
            <input formControlName="content" placeholder="Add note">
            <button class="button" type="submit" [disabled]="noteForm.invalid"><span aria-hidden="true">＋</span> Add</button>
          </form>

          @if (notes().length === 0) {
            <cc-status-panel title="No notes" message="Account notes will appear here." compact />
          } @else {
            <div class="grid">
              @for (note of notes(); track note.id) {
                <article class="status-panel compact">
                  <strong>{{ note.author?.name || "Team" }} · {{ note.createdAt | date: "MMM d, y" }}</strong>
                  <span>{{ note.content }}</span>
                </article>
              }
            </div>
          }
        }
      </section>
    }
  `
})
export class ClientDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly clientsService = inject(ClientsService);
  private readonly notesService = inject(NotesService);
  private readonly fb = inject(FormBuilder);

  readonly tabs: ClientTab[] = ["Info", "Contacts", "Deals", "Notes"];
  readonly tab = signal<ClientTab>("Info");
  readonly loading = signal(true);
  readonly client = signal<Client | null>(null);
  readonly contacts = signal<Contact[]>([]);
  readonly deals = signal<Deal[]>([]);
  readonly notes = signal<Note[]>([]);
  readonly noteForm = this.fb.nonNullable.group({
    content: ["", Validators.required]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const id = this.route.snapshot.paramMap.get("id") ?? "";
    forkJoin({
      client: this.clientsService.get(id),
      contacts: this.clientsService.contacts(id),
      deals: this.clientsService.deals(id),
      notes: this.clientsService.notes(id)
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ client, contacts, deals, notes }) => {
          this.client.set(client);
          this.contacts.set(contacts);
          this.deals.set(deals);
          this.notes.set(notes);
        }
      });
  }

  addNote(): void {
    const client = this.client();
    if (!client || this.noteForm.invalid) {
      return;
    }
    this.notesService.create({ clientId: client.id, content: this.noteForm.getRawValue().content }).subscribe({
      next: (note) => {
        this.notes.update((notes) => [note, ...notes]);
        this.noteForm.reset();
      }
    });
  }
}
