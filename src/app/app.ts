import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { NcToastContainerComponent } from './shared/components';
import { checkForUpdates } from './app.config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NcToastContainerComponent],
  template: `<router-outlet /><nc-toast-container />`,
})
export class App {
  constructor() {
    const sw = inject(SwUpdate);
    const swPush = inject(SwPush);
    const router = inject(Router);

    checkForUpdates(sw);

    if (swPush.isEnabled) {
      swPush.notificationClicks.subscribe(ev => {
        const deepLink = ev.notification.data?.deepLink as string | undefined;
        if (deepLink) {
          router.navigateByUrl(deepLink);
        }
      });
    }
  }
}
