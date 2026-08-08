import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from './common.service';
import { tap } from 'rxjs/operators';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  menuList: any[] = [];
   RoleID: any = 1;

  constructor(
    private http: HttpClient,
    public commonService: CommonService,
    public userService: UserService,
  ) {
    this.RoleID = this.userService.RoleID
   }

  getMenus() {
    const roleId = this.userService.RoleID;
    return this.commonService.getData('list/getRolePermissions/'+roleId)
      .pipe(
        tap((response: any) => {
          if (response.status === true) {
            this.menuList = response.data;
          }
        })
      );
  }

  setMenus(data: any) {
    this.menuList = data;
  }

  getMenuIdByPath(path: string) {
    let menu = this.menuList.find(
      (x: any) =>
        x.PagePath?.replace('/', '') === path
    );

    return menu?.MenuId || 0;
  }

  getPermissions(menuId: number) {
    return this.menuList.filter(
      (x: any) =>
        x.ParentId == menuId &&
        x.IsOption
    );
  }
}