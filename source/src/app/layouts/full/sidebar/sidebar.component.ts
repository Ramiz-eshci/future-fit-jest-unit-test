// import {
//   Component,
//   EventEmitter,
//   Input,
//   OnInit,
//   Output,
//   ViewChild,
// } from '@angular/core';
// import { BrandingComponent } from './branding.component';
// import { TablerIconsModule } from 'angular-tabler-icons';
// import { MaterialModule } from 'src/app/material.module';

// @Component({
//   selector: 'app-sidebar',
//   standalone: true,
//   imports: [BrandingComponent, TablerIconsModule, MaterialModule],
//   templateUrl: './sidebar.component.html',
// })
// export class SidebarComponent implements OnInit {
//   constructor() { }
//   @Input() showToggle = true;
//   @Output() toggleMobileNav = new EventEmitter<void>();
//   @Output() toggleCollapsed = new EventEmitter<void>();

//   ngOnInit(): void { }
// }
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';

import { BrandingComponent } from './branding.component';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';

// import { MenuService } from 'src/app/services/menu.service';
import { NavItem } from './nav-item/nav-item';
import { AppNavItemComponent } from './nav-item/nav-item.component';
import { CommonModule } from '@angular/common';
import { MenuService } from 'src/app/services/menu.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,

  imports: [
    CommonModule,
    BrandingComponent,
    TablerIconsModule,
    MaterialModule,
    AppNavItemComponent
  ],

  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {

  @Input() showToggle = true;

  @Output()
  toggleMobileNav =
    new EventEmitter<void>();

  @Output()
  toggleCollapsed =
    new EventEmitter<void>();


  menuItems: NavItem[] = [];

  constructor(
    private menuService: MenuService
  ) { }

  ngOnInit(): void {

    this.loadMenus();

  }

  loadMenus() {

    this.menuService
      .getMenus()
      .subscribe((res: any) => {

        if (res.status) {

          // this.menuService.setMenus(
          //   res.data
          // );

          this.menuItems =
            this.buildMenuTree(
              res.data
            );

        }

      });

  }

  buildMenuTree(data: any[]): NavItem[] {

    let result: any[] = [];
    console.log('Menu Data:', data);


    const homeMenus = data.filter(x =>
      x.ParentMenuName == 'Menu' &&
      x.PagePath
    );
    const operationMenus = data.filter(x =>
      x.ParentMenuName == 'Operations'
    );

    const masterMenus = data.filter(x =>
      x.IsMenu &&
      x.ParentMenuName == 'Masters'
    );
    console.log('Home Menus:', homeMenus);
    console.log('Master Menus:', masterMenus);

    if (homeMenus.length) {

      result.push({
        navCap: 'HOME'
      });


      homeMenus.forEach(menu => {

        result.push({
          MenuId: menu.MenuId,
          displayName: menu.MenuName,
          route: menu.PagePath,
          iconName: this.getIcon(menu.MenuName)
        });

      });

    }
     if (operationMenus.length) {

      result.push({
        navCap: 'OPERATIONS'
      });

      operationMenus.forEach(menu => {

        result.push({
          MenuId: menu.MenuId,
          displayName: menu.MenuName,
          route: menu.PagePath,
          iconName: this.getIcon(menu.MenuName)
        });

      });

    }

    if (masterMenus.length) {

      result.push({
        navCap: 'MASTERS'
      });

      masterMenus.forEach(menu => {

        result.push({
          MenuId: menu.MenuId,
          displayName: menu.MenuName,
          route: menu.PagePath,
          iconName: this.getIcon(menu.MenuName)
        });

      });

    }
   

    return result;

    console.log('Menu Tree:', result);
  }


  getIcon(name: string) {

    let icons: any = {

      Dashboard: 'solar:widget-add-line-duotone',
      Company: 'vaadin:office',
      Site: 'solar:buildings-3-linear',
      Product: 'solar:bag-3-outline',
      'Financial Asset': 'solar:wallet-outline',
      'Purchase Information': 'solar:box-outline',
      Masters: 'solar:user-linear',
      Category: 'solar:card-broken',
      Users: 'solar:user-linear',
      Role: 'solar:user-linear',
      'Tutorial Videos': 'game-icons:help'

    };

    return icons[name] ||
      'solar:widget-add-line-duotone';

  }

  // buildMenuTree(data: any[]): NavItem[] {

  //   let map: any = {};

  //   let roots: any = [];

  //   data
  //     .filter(x => !x.IsOption)
  //     .forEach(menu => {

  //       map[menu.MenuId] = {

  //         MenuId: menu.MenuId,
  //         displayName: menu.MenuName,
  //         route: menu.PagePath,
  //         iconName: this.getIcon(
  //           menu.MenuName
  //         ),
  //         children: []
  //       };

  //     });


  //   data
  //     .filter(x => !x.IsOption)
  //     .forEach(menu => {

  //       if (menu.ParentId == 0) {

  //         roots.push(
  //           map[menu.MenuId]
  //         );

  //       }
  //       else {

  //         map[
  //           menu.ParentId
  //         ]?.children.push(
  //           map[menu.MenuId]
  //         );

  //       }

  //     });

  //   return roots;

  // }
  // buildMenuTree(data: any[]): NavItem[] {

  //   let map: any = {};
  //   let result: any = [];

  //   // create menu objects
  //   data
  //     .filter(x => !x.IsOption)
  //     .forEach(menu => {

  //       map[menu.MenuId] = {

  //         MenuId: menu.MenuId,
  //         displayName: menu.MenuName,
  //         route: menu.PagePath,
  //         iconName: this.getIcon(
  //           menu.MenuName
  //         ),
  //         children: [],
  //         navCap: null
  //       };

  //     });

  //   // build hierarchy
  //   data
  //     .filter(x => !x.IsOption)
  //     .forEach(menu => {

  //       if (menu.ParentId != 0) {

  //         map[
  //           menu.ParentId
  //         ]?.children.push(
  //           map[menu.MenuId]
  //         );

  //       }

  //     });

  //   // HOME section
  //   result.push({
  //     navCap: 'Home'
  //   });

  //   // children of Menu
  //   if (map[5]) {

  //     map[5].children.forEach(
  //       (x: any) => result.push(x)
  //     );

  //   }

  //   // MASTERS section
  //   result.push({
  //     navCap: 'Masters'
  //   });

  //   // children of Masters
  //   if (map[32]) {

  //     map[32].children.forEach(
  //       (x: any) => result.push(x)
  //     );

  //   }

  //   return result;

  // }
  // buildMenuTree(data: any[]): NavItem[] {

  //   let result: any = [];

  //   result.push({
  //     navCap: 'Home'
  //   });

  //   let menus = data.filter(
  //     x => x.ParentId == 5
  //   );

  //   menus.forEach(menu => {

  //     if (menu.MenuName != 'Menu') {

  //       result.push({

  //         MenuId: menu.MenuId,
  //         displayName: menu.MenuName,
  //         route: menu.PagePath,
  //         iconName: this.getIcon(
  //           menu.MenuName
  //         )

  //       });

  //     }

  //   });


  //   return result;

  // }

}
