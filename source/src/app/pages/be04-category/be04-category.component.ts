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
export interface Category {

  category_name: string;
}
@Component({
  selector: 'app-be04-category',
  standalone: true,
  imports: [MaterialModule, MatMenuModule, MatButtonModule, MatTabsModule, FormatColumnPipe, CommonModule, MatTableModule, MatPaginatorModule, RouterModule],
  templateUrl: './be04-category.component.html',
  styleUrl: './be04-category.component.scss'
})
export class Be04CategoryComponent {
  displayedColumns: string[] = [

    'category_name'

  ];
  totalData: number;
  dataSource = new MatTableDataSource<Category>();
  categories: Category[];
  isLoading = false;
  title = 'Category';
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
  ) { }

  getTableData$(pageNumber: number, pageSize: number, filter: string) {
    return this.commonService.getDatatableFilter(
      'be04-category/getDatatable',
      pageNumber,
      pageSize,
      filter
    );
  }
  ngOnInit() {

    Promise.resolve().then(() => {
      this.canAdd =
        this.permissionService
          .hasPermission('Category_Add');
      this.canEdit =
        this.permissionService
          .hasPermission('Category_Edit');

      this.canDelete =
        this.permissionService
          .hasPermission('Category_Delete');

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
        this.categories = data;
        this.isLoading = false;
        this.dataSource = new MatTableDataSource(this.categories);
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

  deleteCategory(category_id: number) {
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
        this.commonService.postData('be04-category/delete/' + category_id,{}).subscribe(
          (response) => {
            Swal.fire('Deleted!', 'Category has been successfully deleted', 'success');
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