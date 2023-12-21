import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HematologyComponent } from './hematology.component';

describe('HematologyComponent', () => {
  let component: HematologyComponent;
  let fixture: ComponentFixture<HematologyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HematologyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HematologyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
