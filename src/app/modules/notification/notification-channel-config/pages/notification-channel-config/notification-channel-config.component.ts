import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { ErpEmptyStateComponent } from 'src/app/shared/components/erp-empty-state/erp-empty-state.component';
import { ErpPermissionDirective } from 'src/app/shared/directives/erp-permission.directive';
import { AvlSwitchComponent } from 'src/app/shared/forms/avl-switch/avl-switch.component';
import { AvlButtonComponent } from 'src/app/shared/buttons/avl-button/avl-button.component';
import { ErpNotificationService } from 'src/app/shared/services/erp-notification.service';

import { NotificationChannelConfigFacade } from '../../facades/notification-channel-config.facade';
import { NotificationChannelConfigApiService } from '../../services/notification-channel-config-api.service';
import { NotificationChannelConfigDto } from '../../models/notification-channel-config.model';

/**
 * NotificationChannelConfigComponent (SCR-NOTIF-003 — Channel Configuration).
 * PATTERN-2 (Inline Toggle List): no Search/Entry split (F4-RULE-5 N/A) — 5 fixed
 * rows, edited inline. Toggle is immediate-effect (per avl-switch's own doc
 * comment); configJson is edited locally and committed via an explicit Save
 * per row (per-row saving spinner via facade.savingId()).
 * @plan execution-plan.md @phase F4 @scr SCR-NOTIF-003
 */
@Component({
  selector: 'app-notification-channel-config',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, CardComponent, ErpEmptyStateComponent, ErpPermissionDirective, AvlSwitchComponent, AvlButtonComponent],
  templateUrl: './notification-channel-config.component.html',
  styleUrls: ['./notification-channel-config.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [NotificationChannelConfigFacade, NotificationChannelConfigApiService]
})
export class NotificationChannelConfigComponent implements OnInit {
  private readonly notificationService = inject(ErpNotificationService);

  readonly facade = inject(NotificationChannelConfigFacade);

  readonly configs = computed(() => this.facade.configs());
  readonly isLoading = computed(() => this.facade.loading());
  readonly hasError = computed(() => !!this.facade.error());
  readonly savingId = computed(() => this.facade.savingId());

  // Local, uncommitted edits to configJson per row — Save pushes to the facade.
  private readonly editedJsonSignal = signal<Record<number, string>>({});

  constructor() {
    effect(() => {
      const saveError = this.facade.saveError();
      if (!saveError) return;
      untracked(() => this.notificationService.error(saveError));
    });

    // Seed local edit buffers once configs load (only for rows not already edited).
    effect(() => {
      const configs = this.configs();
      untracked(() => {
        this.editedJsonSignal.update((current) => {
          const next = { ...current };
          for (const c of configs) {
            if (!(c.id in next)) next[c.id] = c.configJson ?? '';
          }
          return next;
        });
      });
    });
  }

  ngOnInit(): void {
    this.facade.loadConfigs();
  }

  jsonFor(config: NotificationChannelConfigDto): string {
    return this.editedJsonSignal()[config.id] ?? config.configJson ?? '';
  }

  onJsonChange(config: NotificationChannelConfigDto, value: string): void {
    this.editedJsonSignal.update((current) => ({ ...current, [config.id]: value }));
  }

  onToggle(config: NotificationChannelConfigDto, isEnabledFl: boolean): void {
    this.facade.toggle(config.id, isEnabledFl, () => {
      this.notificationService.success('MESSAGES.UPDATE_SUCCESS');
    });
  }

  onSaveConfig(config: NotificationChannelConfigDto): void {
    this.facade.saveConfig(config.id, this.jsonFor(config), () => {
      this.notificationService.success('MESSAGES.UPDATE_SUCCESS');
    });
  }
}
