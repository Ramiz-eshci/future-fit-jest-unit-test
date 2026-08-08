import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { EditBe04CategoryComponent } from './edit-be04-category.component';

describe('EditBe04CategoryComponent', () => {
  let component: EditBe04CategoryComponent;
  let fixture: ComponentFixture<EditBe04CategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditBe04CategoryComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditBe04CategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
