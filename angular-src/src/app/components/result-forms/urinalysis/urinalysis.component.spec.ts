import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UrinalysisComponent } from './urinalysis.component';

describe('UrinalysisComponent', () => {
  let component: UrinalysisComponent;
  let fixture: ComponentFixture<UrinalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UrinalysisComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UrinalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
