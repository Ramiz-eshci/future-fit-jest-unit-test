export interface NavItem {
  MenuId?: number;
  displayName?: string;
  divider?: boolean;
  iconName?: string;
  navCap?: string;
  route?: string;
  permissionCheck?: boolean;
  permissionValue?: string;
  roles?: any;
  id?: string;
  children?: NavItem[];
}
