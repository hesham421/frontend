import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AvlAvatarSize = 'xs' | 'sm' | 'md' | 'lg';

const DIMS: Record<AvlAvatarSize, number> = { xs: 24, sm: 30, md: 38, lg: 48 };
const PALETTE = ['var(--blue-600)', 'var(--teal-600)', 'var(--slate-600)', 'var(--blue-800)', 'var(--teal-700)'];

/**
 * AVELYNQ Avatar — design-system/avelynq-source/components/data-display/Avatar.d.ts.
 * Image or deterministic initials tinted from the brand palette.
 */
@Component({
  selector: 'avl-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="avl-avatar"
      [class.avl-avatar--square]="square"
      [style.width.px]="dim"
      [style.height.px]="dim"
      [style.background]="src ? 'transparent' : tint"
      [style.font-size.px]="fontSize"
    >
      @if (src) {
        <img [src]="src" [alt]="name" class="avl-avatar__img" />
      } @else {
        {{ initials }}
      }
    </span>
  `,
  styles: [`
    :host { display: inline-block; }

    .avl-avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      color: #fff;
      overflow: hidden;
      flex-shrink: 0;
      font-family: var(--font-sans);
      font-weight: var(--fw-semibold);
      letter-spacing: 0.01em;
    }

    .avl-avatar--square { border-radius: var(--radius-md); }

    .avl-avatar__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvlAvatarComponent {
  @Input() name = '';
  @Input() src?: string | null;
  @Input() size: AvlAvatarSize = 'md';
  @Input() square = false;

  get dim(): number {
    return DIMS[this.size] ?? DIMS.md;
  }

  get fontSize(): number {
    return Math.round(this.dim * 0.38);
  }

  get initials(): string {
    return this.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }

  get tint(): string {
    let h = 0;
    for (let i = 0; i < this.name.length; i++) {
      h = (h * 31 + this.name.charCodeAt(i)) % PALETTE.length;
    }
    return PALETTE[h];
  }
}
