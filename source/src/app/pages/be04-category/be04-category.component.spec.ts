import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Be04CategoryComponent } from './be04-category.component';

describe('Be04CategoryComponent', () => {
  let component: Be04CategoryComponent;
  let fixture: ComponentFixture<Be04CategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Be04CategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be04CategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
