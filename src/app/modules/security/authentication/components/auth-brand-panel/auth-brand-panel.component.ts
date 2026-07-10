import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Shared AVELYNQ brand panel for the auth split-shell (login, sign-up,
 * password-recovery). Renders as the `.avl-split__aside` flex item — the
 * host element carries that class from the consuming template, this
 * component only owns its own visual content and styling.
 */
@Component({
  selector: 'app-auth-brand-panel',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './auth-brand-panel.component.html',
  styleUrls: ['./auth-brand-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'complementary' }
})
export class AuthBrandPanelComponent {
  readonly currentYear = new Date().getFullYear();
}
