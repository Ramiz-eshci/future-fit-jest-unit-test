import { Component, ViewChild } from '@angular/core';
 
 
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
export interface Purchase {
  purchase_information_id: number;
  company_name?: string;
  purchase: string;
  purchase_id: string;
  cost: number;
  purchase_type: string;
  product_input: string;  // Yes/No dropdown value
}
@Component({
  selector: 'app-purchase',
  standalone: true,
    imports: [MaterialModule, MatMenuModule, MatButtonModule, MatTabsModule, FormatColumnPipe, CommonModule, MatTableModule, MatPaginatorModule, RouterModule],
  templateUrl: './purchase.component.html',
  styleUrl: './purchase.component.scss'
})
export class PurchaseComponent {
 displayedColumns: string[] = [
    'company_name',
    'purchase',
   'purchase_id',
    'year',
    'cost',
    'purchase_type',
    'product_input'
  ];

  totalData: number;
  dataSource = new MatTableDataSource<Purchase>();
  Purchases: Purchase[];
  isLoading = false;
  RoleID: any = 1;
  title = 'Purchase';
  canEdit = false;
  canAdd = false;
  canDelete = false;
  filterValue = '';
  pageSizes = [5, 10, 25];

  @ViewChild('paginator') paginator: MatPaginator;

  constructor(
    public commonService: CommonService,
    public permissionService: RolepermissionService,
    public userService: UserService
  ) {
    this.RoleID = this.userService.RoleID;

    if (this.RoleID == 1) {
      this.displayedColumns = [
        'company_name',
        'purchase',
        'purchase_id',
        'year',
        'cost',
        'purchase_type',
        'product_input'
      ];
    } else {
      this.displayedColumns = [
        'purchase',
        'purchase_id',
        'year',
        'cost',
        'purchase_type',
        'product_input'
      ];
    }
  }

  getTableData$(pageNumber: number, pageSize: number, filter: string) {
    return this.commonService.getDatatableFilter(
      'purchase/getDatatable',
      pageNumber,
      pageSize,
      filter
    );
  }
  ngOnInit() {

    Promise.resolve().then(() => {
      this.canAdd =
        this.permissionService
          .hasPermission('Purchase Information_Add');
      this.canEdit =
        this.permissionService
          .hasPermission('Purchase Information_Edit');

      this.canDelete =
        this.permissionService
          .hasPermission('Purchase Information_Delete');

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
        map((res) => {
          if (res == null) return [];
          this.totalData = res.total;
          this.isLoading = false;
          return res.data;
        })
      )
      .subscribe((data) => {
        this.Purchases = data;
        this.isLoading = false;
        this.dataSource = new MatTableDataSource(this.Purchases);
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.filterValue = filterValue;
    this.paginator.pageIndex = 0;
    this.loadTableData();
  }

  loadTableData() {
    this.paginator.page.emit();
  }

  deletePurchase(purchase_information_id: number) {
    Swal.fire({
      title: 'Are you sure you want to proceed?',
      text: 'Once deleted, this data cannot be recovered.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete',
    }).then((result) => {
      if (result.isConfirmed) {
        this.commonService
          .postData('purchase/delete/' + purchase_information_id,{})
          .subscribe(
            (response) => {
              Swal.fire(
                'Deleted!',
                'Your data has been successfully deleted',
                'success'
              );
              this.paginator.page.emit();
            },
            (error) => {
              console.error('An error occurred:', error);
            }
          );
      }
    });
  }
}

