import { AfterViewInit, Component, OnInit, ViewChild,ChangeDetectorRef } from '@angular/core';
import { User, DataTable, fit } from '../../models/datatable';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MaterialModule } from '../../material.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { merge, Observable, of as observableOf, pipe, } from 'rxjs';
import { catchError, map, startWith, switchMap,finalize } from 'rxjs/operators';
import { CommonService } from 'src/app/services/common.service';
import { CommonModule } from '@angular/common';
import { FormatColumnPipe } from '../../shared/format-column.pipe';
import { RouterModule,Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserService } from 'src/app/services/user.service';
@Component({
  selector: 'app-be-form',
  standalone: true,
  imports: [MaterialModule, MatMenuModule, MatButtonModule, MatTabsModule, FormatColumnPipe, CommonModule, MatTableModule, MatPaginatorModule, RouterModule],
  templateUrl: './be-form.component.html',
  styleUrl: './be-form.component.scss'
})
export class BeFormComponent {
  title: any = 'BE Form'
  displayedColumns: string[] = [
    "goal_code",
    "goal_short_name",
    "last_updated_by",
    "latest_modified",
    // Add any other fields specific to manufacturers
  ];
  // displayedColumns: string[] = [
  //   "site_name",
  //   "side_ID",
  //   "location",
  //   "relevance",
  //   "renewable_energy",
  //   "total_energy",
  //   "site_fitness",
  //   "comments",
  //   // Add any other fields specific to manufacturers
  // ];
  manufacturerTable: DataTable;

  totalData: number = 0;
  ManufacturerDataTemp: any;
  ManufacturerData: fit[] = [];
  RoleID: any = 1;

  dataSource = new MatTableDataSource<fit>();

  isLoading = false;
  // title = 'Manufacturer';

  constructor(
    public commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private router: Router,
  ) {
    this.RoleID = this.userService.RoleID
    // if (this.RoleID != 1) {
    //   this.router.navigate(['/']);
    // }
  }

  filterValue = '';
  @ViewChild('paginator') paginator: MatPaginator;

  pageSizes = [25, 50, 100, 500];

  getTableData$(pageNumber: Number, pageSize: Number, filter: string) {
    return this.commonService.getDatatableFilter('be-listing/GetBEListDatatableNew', pageNumber, pageSize, filter);
  }

  ngAfterViewInit() {
    // We need to wait for change detection to complete before loading data
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.setupPaginatorSubscription();
    });
  }
  onFitClick(goal_code: string): void {
    // alert("ok"+goal_code)
     
    this.router.navigate(['/be-form/add',goal_code]); 
}

  

  setupPaginatorSubscription() {
    this.paginator.page
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoading = true;
          this.cdr.detectChanges(); // Explicitly trigger change detection

          return this.getTableData$(
            this.paginator.pageIndex + 1,
            this.paginator.pageSize,
            this.filterValue
          ).pipe(
            catchError(() => observableOf(null)),
            finalize(() => {
              this.isLoading = false;
              this.cdr.detectChanges(); // Explicitly trigger change detection
            })
          );
        }),
        map((manufacturerData) => {
          if (manufacturerData == null) return [];
          this.totalData = manufacturerData.total;
          return manufacturerData.data;
        })
      )
      .subscribe((manufacturerData) => {
        this.ManufacturerData = manufacturerData;
        this.dataSource = new MatTableDataSource(this.ManufacturerData);
        this.cdr.detectChanges(); // Ensure UI is updated
      });

    // Initial data load
    // this.loadTableData();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filterValue = filterValue;
    this.paginator.pageIndex = 0; // Reset to first page
    this.loadTableData();
  }

  loadTableData() {
    this.paginator.page.emit(); // Trigger paginator's page event to refresh data
  }

 
  deleteFutureFitList(fit_id: any) {
 
     Swal.fire({
       title: 'Are you sure you want to proceed?',
       text: "Once deleted, this data cannot be recovered.",
       icon: 'warning',
       showCancelButton: true,
       confirmButtonColor: '#3085d6',
       cancelButtonColor: '#d33',
       confirmButtonText: 'Yes, delete'
     }).then((result) => {
       if (result.isConfirmed) {
         this.commonService.postData('be-listing/delete/' + fit_id,{}).subscribe(
           response => {
             // Perform your action here
             Swal.fire(
               'Deleted!',
                'Your data has been successfully deleted',
               'success'
             );
             this.paginator.page.emit();
           },
           error => {
             console.error('An error occurred:', error);
           }
         );
 
       }
     });
 
 
   }

  addFakeInputs() {
    let fakeUsername = document.createElement("input");
    fakeUsername.setAttribute("type", "text");
    fakeUsername.setAttribute("name", "fake-username");
    fakeUsername.setAttribute("autocomplete", "off");
    fakeUsername.style.position = "absolute";
    fakeUsername.style.opacity = "0";

    let fakePassword = document.createElement("input");
    fakePassword.setAttribute("type", "password");
    fakePassword.setAttribute("name", "fake-password");
    fakePassword.setAttribute("autocomplete", "off");
    fakePassword.style.position = "absolute";
    fakePassword.style.opacity = "0";

    document.body.appendChild(fakeUsername);
    document.body.appendChild(fakePassword);
  }
}
