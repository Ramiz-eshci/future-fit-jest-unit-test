import { AfterViewInit, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from 'src/app/shared/shared.module'; // Import the SharedModule
import { MaterialModule } from '../../../material.module';
import { MatButtonModule } from '@angular/material/button';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormArray
} from '@angular/forms';
import { CommonService } from 'src/app/services/common.service';
import { CommonModule } from '@angular/common';
// import { setTimeout } from 'node:timers/promises';

interface RootCategory {
  score: any;
  id: string;
  name: string;
  type: string;
}

@Component({
  selector: 'app-view-riskowner-average',
  standalone: true,
  imports: [SharedModule,
    MaterialModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './view-riskowner-average.component.html',
  styleUrl: './view-riskowner-average.component.scss'
})
export class ViewRiskownerAverageComponent implements AfterViewInit {
  dropdownValuesCache = new Map<number, RootCategory[]>();
  duration = 1000;
  labelData: any = [];
  riskOwnersForm: FormGroup;
  riskOwnerName: '';
  company_tarr_id: 0;
  isLoading:boolean = false;
  constructor(
    public dialogRef: MatDialogRef<ViewRiskownerAverageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private commonService: CommonService,
  ) {
    this.isLoading = true;
    this.labelData = this.data.labelData;
    this.riskOwnersForm = this.data.riskOwnersForm;
    this.company_tarr_id = this.data.company_tarr_id;
    // console.log(this.data, 'data');
    // console.log(this.riskOwnersForm, 'riskOwnersForm');
    this.riskOwnerName = this.data.riskOwnerName;
    setTimeout(() => {
      
      this.calculateScore()
      this.isLoading = false;
    }, 1000);
    

  }

  onClose(): void {
    this.dialogRef.close();
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      const dialogContainer = document.querySelector('.mat-mdc-dialog-container');
      if (dialogContainer) {
        dialogContainer.scrollTop = 0; // Ensures the dialog starts at the top
      }
    }, 0);
    // this.preloadDropdownValues();  // Call your dropdown data loading method
  }
  preloadDropdownValues(): void {

    // console.log(this.labelData,'this.labelData')
    const uniqueIds = [...new Set(this.labelData.flatMap((category: { sub_label: any[]; }) => category.sub_label.map((sub: { scoring_root_category_id: any; }) => sub.scoring_root_category_id)))].filter((id) => id != null);

    uniqueIds.forEach((id: any) => {
      var dbID = id;
      // if (dbID == 10) {
      //   dbID = 7
      // }
      this.commonService
        .getDropdownData<RootCategory[]>(`list/scoring_dropdown/${dbID}`)
        .subscribe(
          (data: any) => {
            // Ensure it's an array before storing
            if (Array.isArray(data.data)) {
              this.dropdownValuesCache.set(id, data.data);
            } else {
              this.dropdownValuesCache.set(id, []);
            }
            // console.log(`Dropdown values for ID ${id} loaded`);
          },
          (error: any) => {
            console.error(`Error loading dropdown values for ID ${id}:`, error);
            this.dropdownValuesCache.set(id, []); // Set empty array on error
          }
        );
    });

  }
  getDropdownValues(root_category_id: number): RootCategory[] {
    return this.dropdownValuesCache.get(root_category_id) || [];
  }
  ngOnInit(): void {
    // this.populateRiskDescriptors();
  }
  
  // populateRiskDescriptors(): void {
  //   setTimeout(() => {
  //     // Update scoringCategories safely
  //     this.riskOwnersForm.updateValueAndValidity();
  //   });
  // }
  // Getter to access the overAllScoringCategories FormArray directly
  get overAllScoringCategories(): FormArray {
    return this.riskOwnersForm.get('overAllScoringCategories') as FormArray;
  }

  // Function to get subLabels for a specific category index
  getSubLabels(categoryIndex: number): FormArray {
    const categoryForm = this.overAllScoringCategories.at(categoryIndex) as FormGroup; // Access the category at the given index
    return categoryForm.get('overall_subLabels') as FormArray; // Return the subLabels FormArray
  }

  calculateScore(){
    this.isLoading = true;
    var MaterialBrachesinlat12moths = '';
    var MaterialBrachesinlat3moths = '';
    var ErrorOmission3months = '';
    var ErrorOmission12months = '';
    var Serverity = '';
    var Impact = '';
    var Probability = '';
    var KeyControl = '';
    var KeyTestControl = '';
    const overAllScoringCategoriesArray = this.riskOwnersForm.get('overAllScoringCategories') as FormArray;
    console.log(overAllScoringCategoriesArray,'overAllScoringCategoriesArray --- 129')
    const OverallthreadsAndVurlunabilityLabelId = 1;
    const LableID1Value1 = this.getOverallScore(overAllScoringCategoriesArray, OverallthreadsAndVurlunabilityLabelId,0);
    const LableID1Value2 = this.getOverallScore(overAllScoringCategoriesArray, OverallthreadsAndVurlunabilityLabelId,1);

   

    if (LableID1Value1 !== null) {
      MaterialBrachesinlat12moths = LableID1Value1;
    }
    if (LableID1Value2 !== null) {
      MaterialBrachesinlat3moths = LableID1Value2;
    }

    const OverallthreadsAndVurlunabilityOmissionLabelId = 2;
    const LableID2Value1 = this.getOverallScore(overAllScoringCategoriesArray, OverallthreadsAndVurlunabilityOmissionLabelId,0);
    const LableID2Value2 = this.getOverallScore(overAllScoringCategoriesArray, OverallthreadsAndVurlunabilityOmissionLabelId,1);
    if (LableID2Value1 !== null) {
      ErrorOmission12months = LableID2Value1;
    }
    if (LableID2Value2 !== null) {
      ErrorOmission3months = LableID2Value2;
    }

    const SeverityLabelId = 3;
    const LableID3Value1 = this.getOverallScore(overAllScoringCategoriesArray, SeverityLabelId,0);
    if (LableID3Value1 !== null) {
      Serverity = LableID3Value1;
    }

    const ImpactLabelId = 5;
    const LableID4Value1 = this.getOverallScore(overAllScoringCategoriesArray, ImpactLabelId,0);
    if (LableID4Value1 !== null) {
      Impact = LableID4Value1;
    }
    const ProbabilityLabelId = 6;
    const LableID5Value1 = this.getOverallScore(overAllScoringCategoriesArray, ProbabilityLabelId,0);
    if (LableID5Value1 !== null) {
      Probability = LableID5Value1;
    }
    const KeyControlLabelId = 9;
    const LableID6Value1 = this.getOverallScore(overAllScoringCategoriesArray, KeyControlLabelId,0);
    if (LableID6Value1 !== null) {
      KeyControl = LableID6Value1;
    }
    const LableID7Value1 = this.getOverallScore(overAllScoringCategoriesArray, KeyControlLabelId,1);
    if (LableID7Value1 !== null) {
      KeyTestControl = LableID7Value1;
    }
    
    // const formData = new FormData();
    // formData.append('materialVreaches12months', MaterialBrachesinlat12moths);
    // formData.append('materialVreaches3months', MaterialBrachesinlat3moths);
    
    const formData = {
      'companu_tarr_id' : this.company_tarr_id,
      'materialVreaches3months' : MaterialBrachesinlat3moths,
      'materialVreaches12months':MaterialBrachesinlat12moths,
      'errorVreaches3months' : ErrorOmission3months,
      'errorVreaches12months' : ErrorOmission12months,
      'Serverity' : Serverity,
      'Impact' : Impact,
      'Probability' : Probability,
      'KeyControl' : KeyControl,
      'KeyTestControl' : KeyTestControl,
    };
    this.commonService.addData('bra/getOverallScoreValues',formData).subscribe((response) => {
      if (response.status === true) {
        const data = response.data;
        this.setOverallScore(overAllScoringCategoriesArray, OverallthreadsAndVurlunabilityLabelId,0,data.MaterialBrachesinlat12moths);
        this.setOverallScore(overAllScoringCategoriesArray, OverallthreadsAndVurlunabilityLabelId,1,data.MaterialBrachesinlat3moths);
        this.setOverallScore(overAllScoringCategoriesArray, OverallthreadsAndVurlunabilityOmissionLabelId,0,data.ErrorOmissioninlat3months);
        this.setOverallScore(overAllScoringCategoriesArray, OverallthreadsAndVurlunabilityOmissionLabelId,1,data.ErrorOmissioninlat12months);
        this.setOverallScore(overAllScoringCategoriesArray, SeverityLabelId,0,data.Serverity);
        this.setOverallScore(overAllScoringCategoriesArray, ImpactLabelId,0,data.Impact);
        this.setOverallScore(overAllScoringCategoriesArray, ProbabilityLabelId,0,data.Probability);
        this.setOverallScore(overAllScoringCategoriesArray, KeyControlLabelId,0,data.KeyControl);
        this.setOverallScore(overAllScoringCategoriesArray, KeyControlLabelId,1,data.KeyTestControl);
      }
    });
    setTimeout(() => {
      this.isLoading = false;
      
    }, 1000);
  }

  getOverallScore(overAllScoringCategoriesArray: FormArray, labelId: number,scoreIndex: number): any | null {
    if (!overAllScoringCategoriesArray || !overAllScoringCategoriesArray.value) {
      return null;
    }
  
    const targetIndex = overAllScoringCategoriesArray.value.findIndex(
      (item: any) => item.overall_calculation_id === labelId
    );
  
    if (targetIndex === -1) {
      return null;
    }
  
    const subLabelsArray = overAllScoringCategoriesArray
      .at(targetIndex)
      .get('overall_subLabels') as FormArray;
  
    if (!subLabelsArray || !(subLabelsArray.at(scoreIndex) instanceof FormGroup)) {
      return null;
    }
  
    return subLabelsArray.at(scoreIndex)?.get('overall_score')?.value || null;
  }
  setOverallScore(overAllScoringCategoriesArray: FormArray, labelId: number,scoreIndex: number,setValue:any): any | null {
    // console.log('174')
    // console.log(setValue,' ---- 175')
    if (!overAllScoringCategoriesArray || !overAllScoringCategoriesArray.value) {
      return null;
    }
  
    const targetIndex = overAllScoringCategoriesArray.value.findIndex(
      (item: any) => item.overall_calculation_id === labelId
    );
  
    if (targetIndex === -1) {
      return null;
    }
  
    const subLabelsArray = overAllScoringCategoriesArray
      .at(targetIndex)
      .get('overall_subLabels') as FormArray;
  
    if (!subLabelsArray || !(subLabelsArray.at(scoreIndex) instanceof FormGroup)) {
      console.log('193')
      return null;
    }
    
    console.log('197')
    console.log(subLabelsArray.at(scoreIndex),'subLabelsArray.at(scoreIndex) --- 258')
    console.log(subLabelsArray.at(scoreIndex)?.get('options')?.value,'subLabelsArray.at(scoreIndex) --- 258')
    var definations = subLabelsArray.at(scoreIndex)?.get('options')?.value;
    const result = definations.find((item: { id: any; }) => item.id === setValue);
    const definition = result ? result.definition : '';

    subLabelsArray.at(scoreIndex)?.get('overall_selectedOptionId')?.setValue(setValue);
    subLabelsArray.at(scoreIndex)?.get('overall_selectedOptionId')?.updateValueAndValidity();
    subLabelsArray.at(scoreIndex)?.get('overall_defination')?.setValue(definition);
    subLabelsArray.at(scoreIndex)?.get('overall_defination')?.updateValueAndValidity();
  }
  
}
