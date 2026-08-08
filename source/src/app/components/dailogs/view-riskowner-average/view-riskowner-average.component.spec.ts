import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { ViewRiskownerAverageComponent } from './view-riskowner-average.component';
import { CommonService } from 'src/app/services/common.service';

describe('ViewRiskownerAverageComponent', () => {
  let component: ViewRiskownerAverageComponent;
  let fixture: ComponentFixture<ViewRiskownerAverageComponent>;
  let dialogRefSpy: { close: jest.Mock };
  let commonServiceSpy: {
    getData: jest.Mock;
    addData: jest.Mock;
    getDropdownData: jest.Mock;
  };

  const fb = new FormBuilder();

  const labelData: any = [
    { sub_label: [{ scoring_root_category_id: 1 }, { scoring_root_category_id: 2 }] },
    { sub_label: [{ scoring_root_category_id: 1 }] },
  ];

const buildRiskOwnersForm = (): FormGroup => {
    const categoryIds = [1, 2, 3, 5, 6, 9];
    const categories = categoryIds.map((id) =>
      fb.group({
        overall_calculation_id: id,
        overall_subLabels: fb.array([
          fb.group({
            overall_score: ['10'],
            options: new FormControl([
              { id: '10', definition: 'High' },
              { id: '5', definition: 'Medium' },
            ]),
            overall_selectedOptionId: [''],
            overall_defination: [''],
          }),
          fb.group({
            overall_score: ['20'],
            options: new FormControl([
              { id: '20', definition: 'Very High' },
              { id: '15', definition: 'Low' },
            ]),
            overall_selectedOptionId: [''],
            overall_defination: [''],
          }),
        ]),
      })
    );
    return fb.group({ overAllScoringCategories: fb.array(categories) });
  };

  const dialogData = {
    labelData,
    riskOwnersForm: buildRiskOwnersForm(),
    company_tarr_id: 42,
    riskOwnerName: 'John Doe',
  };

  beforeEach(async () => {
    dialogRefSpy = { close: jest.fn() };
    commonServiceSpy = {
      getData: jest.fn().mockReturnValue(of({ status: true, data: [] })),
      addData: jest
        .fn()
        .mockReturnValue(
          of({
            status: true,
            data: {
              MaterialBrachesinlat12moths: 'A',
              MaterialBrachesinlat3moths: 'B',
              ErrorOmissioninlat3months: 'C',
              ErrorOmissioninlat12months: 'D',
              Serverity: 'E',
              Impact: 'F',
              Probability: 'G',
              KeyControl: 'H',
              KeyTestControl: 'I',
            },
          })
        ),
      getDropdownData: jest
        .fn()
        .mockReturnValue(of({ data: [{ id: '1', name: 'Option 1' }] })),
    };

    await TestBed.configureTestingModule({
      imports: [ViewRiskownerAverageComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: CommonService, useValue: commonServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewRiskownerAverageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load labelData, riskOwnersForm, company_tarr_id and riskOwnerName from dialog data', () => {
    expect(component.labelData).toBe(labelData);
    expect(component.riskOwnersForm).toBe(dialogData.riskOwnersForm);
    expect(component.company_tarr_id).toBe(42);
    expect(component.riskOwnerName).toBe('John Doe');
  });

  it('should start in loading state', () => {
    expect(component.isLoading).toBe(true);
  });

  describe('onClose', () => {
    it('should close the dialog', () => {
      component.onClose();
      expect(dialogRefSpy.close).toHaveBeenCalled();
    });
  });

  describe('form accessors', () => {
    it('overAllScoringCategories should return the FormArray', () => {
      const arr = component.overAllScoringCategories;
      expect(arr).toBeInstanceOf(FormArray);
      expect(arr.length).toBe(6);
    });

    it('getSubLabels should return the overall_subLabels FormArray for a category index', () => {
      const subLabels = component.getSubLabels(0);
      expect(subLabels).toBeInstanceOf(FormArray);
      expect(subLabels.length).toBe(2);
    });
  });

  describe('getDropdownValues', () => {
    it('should return cached values when present', () => {
      component.dropdownValuesCache.set(5, [{ id: 'x', name: 'X', type: 't', score: 1 }]);
      expect(component.getDropdownValues(5)).toEqual([{ id: 'x', name: 'X', type: 't', score: 1 }]);
    });

    it('should return an empty array when no cache entry exists', () => {
      expect(component.getDropdownValues(999)).toEqual([]);
    });
  });

  describe('preloadDropdownValues', () => {
    it('should fetch dropdown data for each unique scoring_root_category_id', () => {
      component.preloadDropdownValues();

      expect(commonServiceSpy.getDropdownData).toHaveBeenCalledTimes(2);
      expect(commonServiceSpy.getDropdownData).toHaveBeenCalledWith('list/scoring_dropdown/1');
      expect(commonServiceSpy.getDropdownData).toHaveBeenCalledWith('list/scoring_dropdown/2');
    });

    it('should store an empty array when the response data is not an array', () => {
      commonServiceSpy.getDropdownData.mockReturnValue(of({ data: 'not-an-array' }));
      component.preloadDropdownValues();
      expect(component.dropdownValuesCache.get(1)).toEqual([]);
    });

    it('should store an empty array on error', () => {
      commonServiceSpy.getDropdownData.mockReturnValue(throwError(() => new Error('boom')));
      component.preloadDropdownValues();
      expect(component.dropdownValuesCache.get(1)).toEqual([]);
    });
  });

  describe('getOverallScore', () => {
    it('should return null for a missing label id', () => {
      const arr = component.riskOwnersForm.get('overAllScoringCategories') as FormArray;
      expect(component.getOverallScore(arr, 999, 0)).toBeNull();
    });

    it('should return null when the sub-label index is not a FormGroup', () => {
      const arr = component.riskOwnersForm.get('overAllScoringCategories') as FormArray;
      expect(component.getOverallScore(arr, 1, 5)).toBeNull();
    });

    it('should return the overall_score value for a matching label and index', () => {
      const arr = component.riskOwnersForm.get('overAllScoringCategories') as FormArray;
      expect(component.getOverallScore(arr, 1, 0)).toBe('10');
      expect(component.getOverallScore(arr, 9, 1)).toBe('20');
    });

    it('should handle a null/undefined array', () => {
      expect(component.getOverallScore(null as never, 1, 0)).toBeNull();
    });
  });

  describe('setOverallScore', () => {
    it('should update overall_selectedOptionId and overall_defination', () => {
      const arr = component.riskOwnersForm.get('overAllScoringCategories') as FormArray;
      component.setOverallScore(arr, 1, 0, '5');

      const subLabel = (arr.at(0).get('overall_subLabels') as FormArray).at(0) as FormGroup;
      expect(subLabel.get('overall_selectedOptionId')?.value).toBe('5');
      expect(subLabel.get('overall_defination')?.value).toBe('Medium');
    });

    it('should return null when the label is missing', () => {
      const arr = component.riskOwnersForm.get('overAllScoringCategories') as FormArray;
      expect(component.setOverallScore(arr, 999, 0, 'x')).toBeNull();
    });

    it('should return null when the sub-label index is not a FormGroup', () => {
      const arr = component.riskOwnersForm.get('overAllScoringCategories') as FormArray;
      expect(component.setOverallScore(arr, 1, 99, 'x')).toBeNull();
    });
  });

  describe('calculateScore', () => {
    it('should post the computed score payload to commonService', () => {
      component.calculateScore();

      expect(commonServiceSpy.addData).toHaveBeenCalledWith('bra/getOverallScoreValues', {
        companu_tarr_id: 42,
        materialVreaches3months: '20',
        materialVreaches12months: '10',
        errorVreaches3months: '20',
        errorVreaches12months: '10',
        Serverity: '10',
        Impact: '10',
        Probability: '10',
        KeyControl: '10',
        KeyTestControl: '20',
      });
    });

    it('should apply the returned overall scores to the form', () => {
      component.calculateScore();

      const arr = component.riskOwnersForm.get('overAllScoringCategories') as FormArray;
      const subLabel = (arr.at(0).get('overall_subLabels') as FormArray).at(0) as FormGroup;
      expect(subLabel.get('overall_selectedOptionId')?.value).toBe('A');
    });

    it('should not throw when addData errors', () => {
      commonServiceSpy.addData.mockReturnValue(throwError(() => new Error('boom')));
      expect(() => component.calculateScore()).not.toThrow();
    });
  });
});