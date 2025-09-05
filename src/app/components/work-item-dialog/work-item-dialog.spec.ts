import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkItemDialog } from './work-item-dialog';

describe('WorkItemDialog', () => {
  let component: WorkItemDialog;
  let fixture: ComponentFixture<WorkItemDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkItemDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkItemDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
