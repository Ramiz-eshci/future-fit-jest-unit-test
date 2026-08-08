import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTable, Sites } from '../../models/datatable';
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
  selector: 'app-product',
  standalone: true,
  imports: [MaterialModule, MatMenuModule, MatButtonModule, MatTabsModule, FormatColumnPipe, CommonModule, MatTableModule, MatPaginatorModule, RouterModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent {
  displayedColumns: string[] = [
    "company_name",
    "product_type",
    "product_name",
    "Product_ID",

    "year",
    "revenue_cost",
    "user_group",
    "user_group_ID",
    "site_name"

  ];
  siteTable: DataTable;
  totalData: number;
  SiteDataTemp: any;
  SiteData: Sites[];
  canEdit = false;
  canAdd = false;
  canDelete = false;
  dataSource = new MatTableDataSource<Sites>();

  isLoading = false;
  RoleID: any = 1;
  title = 'Product';
  constructor(public commonService: CommonService,
    public permissionService: RolepermissionService,
    public userService: UserService,

  ) {
    this.RoleID = this.userService.RoleID

    if (this.RoleID == 1) {
      this.displayedColumns = [
        "company_name",
        "product_type",
        "product_name",
        "Product_ID",
        "year",
        "revenue_cost",
        "user_group",
        // "user_group_ID"
        // "site_name"

      ]
    } else {
      this.displayedColumns = [
        "product_type",
        "product_name",
        "Product_ID",
        "year",
        "revenue_cost",
        "user_group",
        // "user_group_ID",
        "site_name"
      ]
    }
  }
  filterValue = '';
  @ViewChild('paginator') paginator: MatPaginator;

  pageSizes = [5, 10, 25];

  getTableData$(pageNumber: Number, pageSize: Number, filter: string) {
    return this.commonService.getDatatableFilter('product/getDatatable', pageNumber, pageSize, filter);
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
  ngOnInit() {

    Promise.resolve().then(() => {
      this.canAdd =
        this.permissionService
          .hasPermission('Product_Add');
      this.canEdit =
        this.permissionService
          .hasPermission('Product_Edit');

      this.canDelete =
        this.permissionService
          .hasPermission('Product_Delete');

    });

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
        this.commonService.postData('product/delete/' + user_id, {}).subscribe(
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
