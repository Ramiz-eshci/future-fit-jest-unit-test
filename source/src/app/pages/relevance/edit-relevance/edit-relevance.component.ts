import { Component, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormArray
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from 'src/app/services/user.service';
import { ValidationService } from 'src/app/services/validation.service';
import { CommonService } from 'src/app/services/common.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorLogService } from 'src/app/services/error-log.service';
import { catchError, map, of } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatOption, MatSelect, MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-edit-relevance',
  standalone: true,
  imports: [MaterialModule, MatMenuModule, MatButtonModule, MatTabsModule, CommonModule, MatTableModule, MatPaginatorModule,
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule],
  templateUrl: './edit-relevance.component.html',
  styleUrl: './edit-relevance.component.scss'
})
export class EditRelevanceComponent {
  
  selectedCompanyType = '';
  loading: boolean = false;
  apiErrors: any = {};
  relevanceForm: any;
  title: any = 'Relevance';
  routeId: string | null = null;

  @ViewChild('select') select: MatSelect;
  constructor(private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private errorLogService: ErrorLogService,
    private _snackBar: MatSnackBar,
    private route: ActivatedRoute,
  ) {
    this.routeId = this.route.snapshot.paramMap.get('id');


    this.relevanceForm = this.formBuilder.group({
      relevance_name: ['', [Validators.required]],
      
    });
    //Residual Risk List

    this.route.paramMap.subscribe(params => {
      this.routeId = params.get('id');
    });
    console.log(this.routeId, 'routerId');
    this.commonService.getData('relevance/getById/' + this.routeId).subscribe((response) => {
      console.log('response p =>', response.status);
      if (response.status === true) {
        this.relevanceForm.controls['relevance_name'].setValue(response.data[0].relevance_name)
      }
    }, (error) => {
      this._snackBar.open('Relevance Not Found', '', {
        duration: 2000,
        verticalPosition: 'top',
        horizontalPosition: 'end',
        panelClass: ['customClass']
      });
      setTimeout(() => {
        this.router.navigate(['/relevance']);
      }, 2000);
    });
    // Subscribe to changes in the password field
  
  }

  ngOnInit() {
  }


  onSubmit() {
    this.loading = true;
    console.log(this.relevanceForm, 'this.relevanceForm')
    this.relevanceForm.controls['relevance_name'].markAsTouched()
   
    // this.companyForm.controls['ExternalTreatScore'].markAsTouched()
    // console.log(this.companyForm, 'this.companyForm')
    if (this.relevanceForm.valid) {
      this.commonService.addData('relevance/edit/' + this.routeId, this.relevanceForm.value).subscribe(
        response => {
          this._snackBar.open(response.message, '', {
            duration: 2000,
            verticalPosition: 'top',
            horizontalPosition: 'end',
            panelClass: ['customSuccessClass']
          });
          setTimeout(() => {
            this.loading = false;
            this.router.navigate(['/relevance']);
          }, 2000);
        },
        error => {
          console.error('An error occurred:', error);
        }
      );


    }
    this.loading = false;
  }

  public handleError(error: any) {
    console.log(error, 'error 123')
  }
  onlyAlphaAndSpace() {

  }
}
