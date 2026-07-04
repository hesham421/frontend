import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  count?: number;
}

/**
 * Underline tab bar per
 * design-system/avelynq-source/components/navigation/Tabs.prompt.md.
 * Plain component (no CDK Overlay needed) — accepts {id,label,icon,count}
 * entries or plain strings, works controlled ([value]/(valueChange)) or
 * uncontrolled (defaults to the first tab).
 */
@Component({
  selector: 'avl-tabs',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="avl-tabs" role="tablist">
      @for (tab of normalizedTabs(); track tab.id) {
        <button
          type="button"
          role="tab"
          class="avl-tabs__tab"
          [class.avl-tabs__tab--active]="tab.id === activeId()"
          [attr.aria-selected]="tab.id === activeId()"
          (click)="select(tab.id)"
        >
          @if (tab.icon) {
            <i [class]="tab.icon"></i>
          }
          {{ tab.label }}
          @if (tab.count != null) {
            <span class="avl-tabs__count">{{ tab.count }}</span>
          }
          <span class="avl-tabs__underline"></span>
        </button>
      }
    </div>
  `,
  styles: [`
    .avl-tabs {
      display: flex;
      gap: var(--space-1, 4px);
      border-block-end: 1px solid var(--border-subtle);
      font-family: var(--font-sans);
      overflow-x: auto;
      flex-wrap: nowrap;
      scrollbar-width: none;
    }
    .avl-tabs::-webkit-scrollbar {
      display: none;
    }
    .avl-tabs__tab {
      position: relative;
      background: none;
      border: none;
      cursor: pointer;
      padding: var(--space-3, 10px) var(--space-4, 14px);
      font-family: var(--font-sans);
      flex-shrink: 0;
      white-space: nowrap;
      font-size: var(--fs-body, 14px);
      font-weight: var(--fw-medium, 500);
      color: var(--text-muted);
      display: inline-flex;
      align-items: center;
      gap: var(--space-2, 7px);
      transition: color var(--dur-fast, 120ms) var(--ease-standard, cubic-bezier(0.2, 0, 0.1, 1));
    }
    .avl-tabs__tab--active {
      font-weight: var(--fw-semibold, 600);
      color: var(--text-strong);
    }
    .avl-tabs__count {
      font-family: var(--font-mono);
      font-size: var(--fs-2xs, 11px);
      font-weight: 600;
      color: var(--text-subtle);
      background: var(--surface-sunken);
      padding: 1px 6px;
      border-radius: var(--radius-pill, 999px);
    }
    .avl-tabs__tab--active .avl-tabs__count {
      color: var(--brand-primary);
      background: var(--blue-50);
    }
    .avl-tabs__underline {
      position: absolute;
      inset-inline: 10px;
      bottom: -1px;
      height: 2px;
      background: transparent;
      border-radius: 2px 2px 0 0;
    }
    .avl-tabs__tab--active .avl-tabs__underline {
      background: var(--brand-primary);
    }
  `]
})
export class AvlTabsComponent {
  readonly tabs = input.required<(TabItem | string)[]>();
  /** Controlled value — omit for uncontrolled mode (defaults to the first tab). */
  readonly value = input<string | undefined>(undefined);
  readonly valueChange = output<string>();

  private readonly internalValue = signal<string | undefined>(undefined);

  readonly normalizedTabs = computed<TabItem[]>(() =>
    this.tabs().map((tab) => (typeof tab === 'string' ? { id: tab, label: tab } : tab))
  );

  readonly activeId = computed(() => this.value() ?? this.internalValue() ?? this.normalizedTabs()[0]?.id);

  select(id: string): void {
    this.valueChange.emit(id);
    if (this.value() === undefined) {
      this.internalValue.set(id);
    }
  }
}
