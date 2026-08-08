import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { AddBe04CategoryComponent } from './add-be04-category.component';

describe('AddBe04CategoryComponent', () => {
  let component: AddBe04CategoryComponent;
  let fixture: ComponentFixture<AddBe04CategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBe04CategoryComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBe04CategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
