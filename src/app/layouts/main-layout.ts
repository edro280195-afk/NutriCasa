import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNavComponent } from '../components/bottom-nav/bottom-nav.component';
import { OfflineBannerComponent } from '../components/offline-banner/offline-banner.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, BottomNavComponent, OfflineBannerComponent],
  template: `
    <app-offline-banner />
    <router-outlet />
    <app-bottom-nav />
  `,
})
export class MainLayout {}
