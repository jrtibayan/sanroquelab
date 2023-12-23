import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FecalysisComponent } from './fecalysis.component';

describe('FecalysisComponent', () => {
  let component: FecalysisComponent;
  let fixture: ComponentFixture<FecalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FecalysisComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FecalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
