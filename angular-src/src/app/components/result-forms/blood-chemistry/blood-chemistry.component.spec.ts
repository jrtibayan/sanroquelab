import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BloodChemistryComponent } from './blood-chemistry.component';

describe('BloodChemistryComponent', () => {
  let component: BloodChemistryComponent;
  let fixture: ComponentFixture<BloodChemistryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BloodChemistryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BloodChemistryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
