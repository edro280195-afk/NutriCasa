import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNavComponent } from '../components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, BottomNavComponent],
  template: `
    <router-outlet />
    <app-bottom-nav />
  `,
})
export class MainLayout {}
