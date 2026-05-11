import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NcToastContainerComponent } from './shared/components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NcToastContainerComponent],
  template: `<router-outlet /><nc-toast-container />`,
})
export class App {}
