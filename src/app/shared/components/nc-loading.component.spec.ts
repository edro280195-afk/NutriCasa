import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NcLoadingComponent } from './nc-loading.component';

describe('NcLoadingComponent', () => {
  let fixture: ComponentFixture<NcLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NcLoadingComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(NcLoadingComponent);
  });

  it('renders spinner by default', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.spinner')).toBeTruthy();
  });

  it('renders message when provided', () => {
    fixture.componentRef.setInput('message', 'Cargando...');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Cargando...');
  });

  it('renders skeleton lines', () => {
    fixture.componentRef.setInput('type', 'skeleton');
    fixture.componentRef.setInput('lines', 2);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.skeleton-line').length).toBe(2);
  });
});
