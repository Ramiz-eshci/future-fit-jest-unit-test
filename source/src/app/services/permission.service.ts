import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor() { }

  // Get permissions from local storage
  getPermissions() {
    const permissions = localStorage.getItem('permissions');
    return permissions ? JSON.parse(permissions) : [];
  }

  // Check if user has a specific permission
  public hasPermission(module: string, permission: string): boolean {
    const RoleID: any = localStorage.getItem('RoleID');
    if(parseInt(RoleID) == 3){
      return true;
      // if(module=='BRA'){
      //   return true;
      // }else{
      //   return false;
      // }
    }else{
      return true;
    }
   
    // return true;
  }
}
