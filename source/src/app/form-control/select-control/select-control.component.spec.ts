import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SelectControlComponent } from './select-control.component';

describe('SelectControlComponent', () => {
  let component: SelectControlComponent;
  let fixture: ComponentFixture<SelectControlComponent>;

  const options = [
    { id: '1', name: 'Alpha' },
    { id: '2', name: 'Beta' },
    { id: '3', name: 'Gamma' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectControlComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectControlComponent);
    component = fixture.componentInstance;
    component.items = [...options];
    component.control = new FormControl();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default multiple to undefined (single-select mode)', () => {
    expect(component.multiple).toBeUndefined();
    component.ngOnInit();
    expect(component._multiple).toBe(false);
  });

  it('should set _multiple true when multiple input provided', () => {
    (component as any).multiple = true;
    component.ngOnInit();
    expect(component._multiple).toBe(true);
  });

  describe('ControlValueAccessor', () => {
    it('should be registered as NG_VALUE_ACCESSOR', () => {
      expect(SelectControlComponent).toBeTruthy();
      const meta = (SelectControlComponent as any).ɵcmp;
      expect(meta).toBeTruthy();
    });

    it('writeValue should set the value and trigger onChange', () => {
      const onChangeSpy = jest.fn();
      component.registerOnChange(onChangeSpy);

      component.writeValue('2');
      expect(component.value).toBe('2');
      expect(onChangeSpy).toHaveBeenCalledWith('2');
    });

    it('registerOnChange should store the provided callback', () => {
      const cb = () => {};
      component.registerOnChange(cb);
      expect(component.onChange).toBe(cb);
    });

    it('registerOnTouched should store the provided callback', () => {
      const cb = () => {};
      component.registerOnTouched(cb);
      expect(component.onTouched).toBe(cb);
    });

    it('should use no-op defaults for onChange and onTouched', () => {
      expect(typeof component.onChange).toBe('function');
      expect(typeof component.onTouched).toBe('function');
    });
  });

  describe('filterManagerTag', () => {
    it('should keep all items when there are no disabled items', () => {
      component.disabledItems = [];
      component.items = [...options];
      component.value = undefined;

      component.filterManagerTag();

      expect(component.newItems).toHaveLength(3);
    });

    it('should remove disabled items', () => {
      component.disabledItems = ['2'];
      component.value = undefined;

      component.filterManagerTag();

      expect(component.newItems.map((i: any) => i.id)).toEqual(['1', '3']);
    });

    it('should keep an item matching the current value even if disabled', () => {
      component.disabledItems = ['1', '2'];
      component.value = '1'; // selected value must remain visible

      component.filterManagerTag();

      expect(component.newItems.map((i: any) => i.id)).toContain('1');
    });

    it('should handle an empty items list', () => {
      component.items = [];
      component.filterManagerTag();
      expect(component.newItems).toEqual([]);
    });
  });

  describe('onSelectionChange', () => {
    it('should emit the selected value', () => {
      const emitSpy = jest.spyOn(component.selectionChange, 'emit');
      component.onSelectionChange({ value: '3' });

      expect(emitSpy).toHaveBeenCalledWith('3');
    });
  });

  describe('GetFilterTag', () => {
    it('should return the full list when no disabled items', () => {
      component.disabledItems = [];
      const tagList = [{ id: '1', name: 'a' }, { id: '2', name: 'b' }];
      expect(component.GetFilterTag(tagList)).toHaveLength(2);
    });

    it('should remove disabled items from the returned list', () => {
      component.disabledItems = ['2'];
      const tagList = [{ id: '1', name: 'a' }, { id: '2', name: 'b' }];
      const result = component.GetFilterTag(tagList);
      expect(result.map((x: any) => x.id)).toEqual(['1']);
    });

    it('should not mutate the original input list', () => {
      component.disabledItems = ['1'];
      const tagList = [{ id: '1', name: 'a' }, { id: '2', name: 'b' }];
      component.GetFilterTag(tagList);
      expect(tagList).toHaveLength(2);
    });
  });
});