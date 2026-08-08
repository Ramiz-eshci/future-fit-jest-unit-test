import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTable, Employees } from '../../models/datatable';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MaterialModule } from '../../material.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { merge, Observable, of as observableOf, pipe } from 'rxjs';  
import { catchError, map, startWith, switchMap } from 'rxjs/operators';  
import { CommonService } from 'src/app/services/common.service';  
import { CommonModule } from '@angular/common';
import { FormatColumnPipe } from '../../shared/format-column.pipe';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { UserService } from 'src/app/services/user.service';
import { RolepermissionService } from 'src/app/services/rolepermission.service';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [MaterialModule, MatMenuModule, MatButtonModule, MatTabsModule, FormatColumnPipe, CommonModule, MatTableModule, MatPaginatorModule, RouterModule],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.scss'
})
export class EmployeeComponent {
  displayedColumns: string[] = [
    "company_name",
    "employee_group",
    "group_ID",
    "year",
    "number_of_employees",
    "site",
    "location",
    "site_name",
    "Site_location",
    "site_ID"
  ];
  employeeTable: DataTable;
  totalData: number;
  EmployeeDataTemp: any;
  EmployeeData: Employees[];

  dataSource = new MatTableDataSource<Employees>();

  isLoading = false;
  title = 'Employee';
  RoleID: any = 1;
  canEdit = false;
  canAdd = false;
  canDelete = false;
  constructor(public commonService: CommonService,
    public permissionService: RolepermissionService,
    public userService: UserService,

  ) {
    this.RoleID = this.userService.RoleID

    if (this.RoleID == 1) {
      this.displayedColumns = [
        "company_name",
        "employee_group",
        "group_ID",
        "year",
        "number_of_employees",
        "site_name",
        "Site_location",
        "site_ID"

      ]
    } else {
      this.displayedColumns = [
        "employee_group",
        "group_ID",
        "year",
        "number_of_employees",
        "site_name",
        "Site_location",
        "site_ID"
      ]
    }
  }
  filterValue = '';
  @ViewChild('paginator') paginator: MatPaginator;

  pageSizes = [5, 10, 25];

  getTableData$(pageNumber: Number, pageSize: Number, filter: string) {
    return this.commonService.getDatatableFilter('employee/getDatatable', pageNumber, pageSize, filter);
  }
  ngOnInit() {

    Promise.resolve().then(() => {
      this.canAdd =
        this.permissionService
          .hasPermission('Employee_Add');
      this.canEdit =
        this.permissionService
          .hasPermission('Employee_Edit');

      this.canDelete =
        this.permissionService
          .hasPermission('Employee_Delete');

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
        this.isLoading = false;
        this.EmployeeData = doctorData;
        this.dataSource = new MatTableDataSource(this.EmployeeData);
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filterValue = filterValue;

    this.paginator.pageIndex = 0;
    this.loadTableData();
  }

  loadTableData() {
    this.paginator.page.emit();
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
        this.commonService.postData('employee/delete/' + user_id,{}).subscribe(
          response => {

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
