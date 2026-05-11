import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NcPageHeaderComponent } from './nc-page-header.component';

describe('NcPageHeaderComponent', () => {
  let fixture: ComponentFixture<NcPageHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NcPageHeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(NcPageHeaderComponent);
  });

  it('renders title', () => {
    fixture.componentRef.setInput('title', 'Mi perfil');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Mi perfil');
  });

  it('renders back link when provided', () => {
    fixture.componentRef.setInput('title', 'Test');
    fixture.componentRef.setInput('backLink', '/home');
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('.back-link') as HTMLElement;
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('/home');
  });

  it('hides back link when omitted', () => {
    fixture.componentRef.setInput('title', 'Test');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.back-link')).toBeNull();
  });
});
