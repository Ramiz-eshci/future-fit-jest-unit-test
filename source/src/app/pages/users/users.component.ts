import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { startWith, switchMap, catchError, map } from 'rxjs';
import { MaterialModule } from 'src/app/material.module';
import { DataTable, Sites } from 'src/app/models/datatable';
import { CommonService } from 'src/app/services/common.service';
import { UserService } from 'src/app/services/user.service';
import { FormatColumnPipe } from 'src/app/shared/format-column.pipe';
import Swal from 'sweetalert2';
import { merge, Observable, of as observableOf, pipe } from 'rxjs';
import { RolepermissionService } from 'src/app/services/rolepermission.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [MaterialModule, MatMenuModule, MatButtonModule, MatTabsModule, FormatColumnPipe, CommonModule, MatTableModule, MatPaginatorModule, RouterModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {

  displayedColumns: string[] = [
    "first_name",
    "last_name",
    "company_name",
    "phone_number",
    "email",  
    "goal_codes"

  ];
  siteTable: DataTable;
  totalData: number;
  SiteDataTemp: any;
  SiteData: Sites[];

  dataSource = new MatTableDataSource<Sites>();
  canEdit = false;
  canAdd = false;
  canDelete = false;
  isLoading = false;
  RoleID: any = 1;
  title = 'Users';
  constructor(public commonService: CommonService,
    public permissionService: RolepermissionService,
    public userService: UserService,

  ) {
    this.RoleID = this.userService.RoleID
    //  ;
    if (this.RoleID == 1) {
      this.displayedColumns = [
        "first_name",
        "last_name",
        "company_name", 
        "phone_number",
        "email",
         "goal_codes"
      ]
    } else {
      this.displayedColumns = [
        "first_name",
        "last_name",
        "company_name", 
        "phone_number",
        "email",
         "goal_codes"
      ]
    }
  }
  filterValue = '';
  @ViewChild('paginator') paginator: MatPaginator;

  pageSizes = [5, 10, 25];

  getTableData$(pageNumber: Number, pageSize: Number, filter: string) {
    return this.commonService.getDatatableFilter('users/getDatatable', pageNumber, pageSize, filter);
  }
ngOnInit() {

    Promise.resolve().then(() => {
      this.canAdd =
        this.permissionService
          .hasPermission('Users_Add');
      this.canEdit =
        this.permissionService
          .hasPermission('Users_Edit');

      this.canDelete =
        this.permissionService
          .hasPermission('Users_Delete');

    });

  }
  ngAfterViewInit() {
    this.loadTableData();
    this.dataSource.paginator = this.paginator;

    this.paginator.page
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoading = true;
          return this.getTableData$(
            this.paginator.pageIndex + 1,
            this.paginator.pageSize,
            this.filterValue
          ).pipe(catchError(() => observableOf(null)));
        }),
        map((doctorData) => {
          if (doctorData == null) return [];
          this.totalData = doctorData.total;
          this.isLoading = false;
          return doctorData.data;
        })
      )
      .subscribe((doctorData) => {
        this.SiteData = doctorData;
        this.isLoading = false;
        this.dataSource = new MatTableDataSource(this.SiteData);
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filterValue = filterValue;
    // Sanitize filter value
    this.paginator.pageIndex = 0; // Reset to first page
    this.loadTableData();
  }

  loadTableData() {
    this.paginator.page.emit(); // Trigger paginator's page event to refresh data
  }

  deleteCompany(user_id: any) {
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
        this.commonService.postData('users/delete/' + user_id,{}).subscribe(
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


}
