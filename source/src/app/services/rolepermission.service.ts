import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RolepermissionService {

  permissions: any[] = [];

  constructor() {
    const permissions =
      localStorage.getItem('permissions');
    this.permissions = permissions && permissions !== 'undefined'
      ? JSON.parse(permissions) : [];
    // this.permissions =
    //   JSON.parse(
    //     localStorage.getItem('permissions') || '[]'
    //   );

  }

  setPermissions(data: any[]) {

    this.permissions = data;

  }

  hasPermission(
    permission: string
  ): boolean {

    return this.permissions.some(

      (x: any) =>

        x.PermissionKey
          ?.toLowerCase()
        ==
        permission
          .toLowerCase()

    );

  }
}
