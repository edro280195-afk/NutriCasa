import { Component, computed, input, signal } from '@angular/core';

@Component({
  selector: 'nc-avatar',
  standalone: true,
  template: `
    @if (showImage()) {
      <img
        [src]="src()"
        [style.width.px]="size()"
        [style.height.px]="size()"
        class="avatar-img"
        (error)="onImgError()"
        [attr.alt]="initials()"
      />
    } @else {
      <div
        class="avatar-fallback"
        [style.width.px]="size()"
        [style.height.px]="size()"
        [style.font-size.px]="fontSize()"
      >
        {{ displayInitials() }}
      </div>
    }
  `,
  styles: [`
    :host { display: contents; }
    .avatar-img { border-radius: 50%; object-fit: cover; display: block; }
    .avatar-fallback {
      border-radius: 50%;
      background: linear-gradient(135deg, var(--mint), var(--lake));
      display: flex; align-items: center; justify-content: center;
      color: var(--pine-darker); font-weight: 700;
    }
  `]
})
export class NcAvatarComponent {
  readonly src = input<string>('');
  readonly initials = input.required<string>();
  readonly size = input(40);

  private readonly imgError = signal(false);

  readonly showImage = computed(() => !!this.src() && !this.imgError());
  readonly fontSize = computed(() => Math.max(10, Math.round(this.size() * 0.4)));
  readonly displayInitials = computed(() => this.initials().slice(0, 2).toUpperCase());

  onImgError() { this.imgError.set(true); }
}
