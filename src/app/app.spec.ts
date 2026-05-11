import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: SwUpdate, useValue: { versionUpdates: { subscribe: () => {} }, activateUpdate: () => Promise.resolve() } },
        { provide: SwPush, useValue: { isEnabled: false, notificationClicks: { subscribe: () => {} } } },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render router outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
  });
});
