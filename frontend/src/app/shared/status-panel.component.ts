import { Component, Input, booleanAttribute } from "@angular/core";

@Component({
  selector: "cc-status-panel",
  standalone: true,
  template: `
    <div class="status-panel" [class.compact]="compact">
      <strong>{{ title }}</strong>
      <span>{{ message }}</span>
    </div>
  `
})
export class StatusPanelComponent {
  @Input({ required: true }) title = "";
  @Input() message = "";
  @Input({ transform: booleanAttribute }) compact = false;
}
