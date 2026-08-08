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
export const MY_YEAR_ONLY_FORMATS = {
  parse: {
    dateInput: 'YYYY',
  },
  display: {
    dateInput: 'YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'YYYY',
    monthYearA11yLabel: 'YYYY',
  },
};

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [MaterialModule, MatMenuModule, MatButtonModule, MatTabsModule, FormatColumnPipe, CommonModule, MatTableModule, MatPaginatorModule, RouterModule],
  templateUrl: './role.component.html',
  styleUrl: './role.component.scss'

})

export class RoleComponent {

  displayedColumns: string[] = [
    'role_name',
    'description',
    'access_level',
    'status'
  ];

  dataSource = new MatTableDataSource<any>();

  RoleData: any = [];
  totalData = 0;
  isLoading = false;
  title = 'Role';
  canEdit = false;
  canAdd = false;
  canDelete = false;
  RoleID: any = 1;


  constructor(public commonService: CommonService,
    public permissionService: RolepermissionService,
    public userService: UserService,

  ) {
    this.RoleID = this.userService.RoleID

  }
  filterValue = '';
  @ViewChild('paginator')
  paginator!: MatPaginator;

  pageSizes = [5, 10, 25];
  getTableData$(pageNumber: Number, pageSize: Number, filter: string) {
    return this.commonService.getDatatableFilter('role/getDatatable', pageNumber, pageSize, filter);
  }
ngOnInit() {

    Promise.resolve().then(() => {
      this.canAdd =
        this.permissionService
          .hasPermission('Role_Add');
      this.canEdit =
        this.permissionService
          .hasPermission('Role_Edit');

      this.canDelete =
        this.permissionService
          .hasPermission('Role_Delete');

    });

  }


  ngAfterViewInit() {

    this.loadTableData();

    this.dataSource.paginator =
      this.paginator;


    this.paginator.page

      .pipe(

        startWith({}),

        switchMap(() => {

          this.isLoading = true;

          return this.getTableData$(

            this.paginator.pageIndex + 1,

            this.paginator.pageSize,

            this.filterValue

          )

            .pipe(

              catchError(() =>
                observableOf(null)
              )

            )

        }),

        map((response: any) => {

          if (response == null)
            return [];

          this.totalData =
            response.total;

          this.isLoading = false;

          return response.data;

        })

      )

      .subscribe((response) => {

        this.RoleData = response;

        this.isLoading = false;

        this.dataSource =
          new MatTableDataSource(
            this.RoleData
          );

      });

  }     

       

  applyFilter(
    event: Event
  ) {

    this.filterValue =
      (event.target as HTMLInputElement)
        .value
        .trim()
        .toLowerCase();

    this.paginator.pageIndex = 0;

    this.loadTableData();

  }



  loadTableData() {
    this.paginator.page.emit();
  }

  
  deleteRole(id: any) {

    Swal.fire({

      title:
        'Are you sure?',

      text:
        'Once deleted, this cannot be recovered.',

      icon: 'warning',

      showCancelButton: true,

      confirmButtonText:
        'Yes'

    })

      .then((result) => {

        if (result.isConfirmed) {

          this.commonService
            .postData(
              'role/delete/' + id,
              {}
            )

            .subscribe(() => {

              Swal.fire(

                'Deleted!',
                'Role deleted successfully',
                'success'

              );

              this.paginator.page.emit();

            })

        }

      })

  }

}