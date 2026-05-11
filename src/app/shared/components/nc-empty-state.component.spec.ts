import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NcEmptyStateComponent } from './nc-empty-state.component';

describe('NcEmptyStateComponent', () => {
  let fixture: ComponentFixture<NcEmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NcEmptyStateComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(NcEmptyStateComponent);
  });

  it('renders title', () => {
    fixture.componentRef.setInput('title', 'Sin datos');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Sin datos');
  });

  it('renders subtitle when provided', () => {
    fixture.componentRef.setInput('title', 'Vacío');
    fixture.componentRef.setInput('subtitle', 'No hay elementos');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No hay elementos');
  });
});
