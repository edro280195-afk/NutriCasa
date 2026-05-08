import { Component, ElementRef, inject, input, OnDestroy, OnInit } from '@angular/core';
import lottie, { AnimationItem } from 'lottie-web';

@Component({
  selector: 'app-lottie',
  standalone: true,
  template: `<div #container class="lottie-container" [style.width]="width()" [style.height]="height()"></div>`,
  styles: [`
    .lottie-container { margin: 0 auto; }
  `]
})
export class LottieAnimationComponent implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);

  readonly src = input.required<string>();
  readonly width = input('100%');
  readonly height = input('200px');
  readonly loop = input(true);
  readonly autoplay = input(true);

  private anim: AnimationItem | null = null;

  ngOnInit() {
    const container = this.el.nativeElement.querySelector('.lottie-container');
    if (!container) return;

    fetch(this.src())
      .then(r => r.json())
      .then(data => {
        this.anim = lottie.loadAnimation({
          container,
          renderer: 'svg',
          loop: this.loop(),
          autoplay: this.autoplay(),
          animationData: data,
        });
      });
  }

  ngOnDestroy() {
    this.anim?.destroy();
  }
}
