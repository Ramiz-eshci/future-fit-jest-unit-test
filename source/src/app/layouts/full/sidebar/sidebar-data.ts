import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Home',
    permissionCheck:false,
  },
  {
    displayName: 'Dashboard',
    iconName: 'solar:widget-add-line-duotone',
    route: '/dashboard',
    permissionCheck:false,
    roles:['1','2','3','4','5']
  },
  {
    displayName: 'BE Form',
    iconName: 'solar:list-check-bold',
    route: '/be-form',
    permissionCheck:true,
    roles:['2','3'],
    id: 'sidebar-be-form-item'
  },
  //  {
  //   displayName: 'Add BE Form',
  //   iconName: 'solar:list-check-bold',
  //   route: '/be-form/add',
  //   permissionCheck:true,
  //   roles:['2','3'],
  //   id: 'sidebar-be-form-item'
  // },
  {
    displayName: 'Operations',
    navCap: 'Operations',
    permissionCheck:true,
    roles:['2']
  },
  {
    displayName: 'Company',
    iconName: 'vaadin:office',
    route: '/company',
    permissionCheck:true,
    roles:['1']
  },
  {
    displayName: 'Sites',
    iconName: 'solar:buildings-3-linear',
    route: '/site',
    permissionCheck:true,
    roles:['1','2'],
    id: 'sidebar-site-item'
  },
  {
    displayName: 'Employees',
    iconName: 'solar:users-group-two-rounded-bold-duotone',
    route: '/employee',
    permissionCheck:true,
    roles:['1','2'],
    id: 'sidebar-employee-item'
  },
  {
    displayName: 'Product',
    iconName: 'solar:bag-3-outline',
    route: '/product',
    permissionCheck:true,
    roles:['1','2'],
    id: 'sidebar-product-item'
  },
   {
    displayName: 'Financial Asset',
    iconName: 'solar:wallet-outline',
    route: '/financial',
    permissionCheck:true,
    roles:['1','2'],
    id: 'sidebar-Financial-item'
  },
  
  {
    displayName: 'Purchase Information',
    iconName: 'solar:box-outline',
    route: '/purchase',
    permissionCheck:true,
    roles:['1','2'],
    id: 'sidebar-Purchase-item'
  },
  {
    displayName: 'Masters',
    navCap: 'Masters',
    permissionCheck:true,
    roles:['1','2']
  },
  {
    displayName: 'Break Even Goals',
    iconName: 'solar:target-linear',
    route: '/break-even-goals',
    permissionCheck:true,
    roles:['1','2']
  },
  // {
  //   displayName: 'Reference Year',
  //   iconName: 'solar:target-linear',
  //   route: '/reference-year',
  //   permissionCheck:true,
  //   roles:['1','2']
  // },
  {
    displayName: 'Relevance',
    iconName: 'solar:target-linear',
    route: '/relevance',
    permissionCheck:true,
    roles:['1']
  },
  // {
  //   displayName: 'Masters',
  //   navCap: 'Masters',
  //   permissionCheck:true,
  //   roles:['2']
  // },
  {
    displayName: 'Category',
    iconName: 'solar:card-broken',
    route: '/be04Category',
    permissionCheck:true,
    roles:['1','2'],
    id: 'sidebar-Financial-item'
  },
  {
    displayName: 'Users',
    iconName: 'solar:user-linear',
    route: '/users',
    permissionCheck:true,
    roles:['2','1'],
    id: 'sidebar-user-item'
  },
  {
    displayName: 'Role',
    iconName: 'solar:user-linear',
    route: '/role',
    permissionCheck:true,
    roles:['1','2'],
    id: 'sidebar-role-item'
  },

  //  {
  //   displayName: 'Risk Profile Master',
  //   navCap: 'Risk Profile Master',
  //   permissionCheck:true,
  //   roles:['1']
  // },
  // {
  //   displayName: 'Sector',
  //   iconName: 'fluent-emoji-high-contrast:department-store',
  //   route: '/risk-profiler/type/sector',
  //   permissionCheck:true,
  //   roles:['1']
  // },
  // {
  //   displayName: 'Sub Sector',
  //   iconName: 'fluent-emoji-high-contrast:department-store',
  //   route: '/risk-profiler/type/sub_sector',
  //   permissionCheck:true,
  //   roles:['1']
  // },
  // {
  //   displayName: 'Business Activity',
  //   iconName: 'carbon:user-activity',
  //   route: '/risk-profiler/type/business_activity',
  //   permissionCheck:true,
  //   roles:['1','2']
  // },
  // {
  //   displayName: 'Characteristics',
  //   iconName: 'ph:files-bold',
  //   route: '/risk-profiler/type/characteristics',
  //   permissionCheck:true,
  //   roles:['1']
  // },
  // {
  //   displayName: 'Logic',
  //   iconName: 'iconoir:brain',
  //   route: '/risk-profiler/type/logic',
  //   permissionCheck:true,
  //   roles:['1','2']
  // },
  // {
  //   displayName: 'Data',
  //   iconName: 'lsicon:data-filled',
  //   route: '/risk-profiler/type/data',
  //   permissionCheck:true,
  //   roles:['1']
  // },
  // {
  //   displayName: 'Current Business Activity',
  //   iconName: 'lsicon:data-filled',
  //   route: '/risk-profiler/type/current_activity',
  //   permissionCheck:true,
  //   roles:['1']
  // },
  // {
  //   displayName: 'Broader Society Impact',
  //   iconName: 'ci:globe',
  //   route: '/company',
  //   permissionCheck:true,
  //   roles:['1']
  // },
  // {
  //   displayName: 'Summary',
  //   iconName: 'tdesign:summary',
  //   route: '/risk-profiler/summary',
  //   permissionCheck:true,
  //   roles:['1']
  // },
  // {
  //   displayName: 'Business Inputs',
  //   iconName: 'fxemoji:inputsymbolfornumbers',
  //   route: '/risk-profiler/business-inputs',
  //   permissionCheck:true,
  //   roles:['1']
  // },
  {
    displayName: 'Tutorial Videos',
    iconName: 'game-icons:help',
    route: '/tutorial-videos',
    permissionCheck:true,
    roles:['1']
  },
  // {
  //   displayName: 'Tutorial Videos',
  //   iconName: 'lets-icons:video-fill',
  //   route: '/risk-profiler/help',
  //   permissionCheck:true,
  //   roles:['1','2']
  // },
   
  // {
  //   displayName: 'External Thread Scores',
  //   iconName: 'vaadin:office',
  //   route: '/company-external-thread',
  //   permissionCheck:true,
  //   roles:['1']
  // },
  // {
  //   displayName: 'My Company Details',
  //   iconName: 'vaadin:office',
  //   route: '/company/details',
  //   permissionCheck:true,
  //   roles:['2']
  // },
  // {
  //   displayName: 'Risk Category',
  //   iconName: 'carbon:category',
  //   route: '/risk-category',
  //   permissionCheck:true,
  //   roles:['1','2']
  // },
  
  // {
  //   displayName: 'Residual Risk',
  //   iconName: 'arcticons:risk',
  //   route: '/residual-risk',
  //   permissionCheck:true,
  //   roles:['1','2']
  // },
  // {
  //   displayName: 'Effectiveness Risk',
  //   iconName: 'arcticons:risk',
  //   route: '/effectiveness-risk-category',
  //   permissionCheck:true,
  //   roles:['1','2']
  // },
  // {
  //   displayName: 'NRA Risk',
  //   iconName: 'arcticons:risk',
  //   route: '/nra-risk-category',
  //   permissionCheck:true,
  //   roles:['1','2']
  // },
  // {
  //   displayName: 'Risk Owner',
  //   iconName: 'openmoji:authority-building',
  //   route: '/risk-owner',
  //   permissionCheck:true,
  //   roles:['1','2']
  // },
  // {
  //   displayName: 'T/V description',
  //   iconName: 'openmoji:authority-building',
  //   route: '/risk-descriptor',
  //   permissionCheck:true,
  //   roles:['1','2']
  // },
  // {
  //   displayName: 'Threats Category',
  //   iconName: 'openmoji:authority-building',
  //   route: '/threats-vulnerability',
  //   permissionCheck:true,
  //   roles:['1','2']
  // },
  // {
  //   displayName: 'Calculation',
  //   // iconName: 'solar:archive-minimalistic-line-duotone',
  //   iconName: 'carbon:category',
  //   route: '/calculation-page',
  //   permissionCheck:true,
  //   roles:['1']
  // },
  
  // {
  //   displayName: 'Scoring Category',
  //   navCap: 'Scoring Category',
  //   permissionCheck:true,
  //   roles:['1','2']
  // },
  // {
  //   displayName: 'Root Category Label',
  //   // iconName: 'solar:archive-minimalistic-line-duotone',
  //   iconName: 'carbon:category',
  //   route: '/scoring-root-category-label',
  //   permissionCheck:true,
  //   roles:['1','2']
  // },
  // {
  //   displayName: 'Scoring Root Category',
  //   // iconName: 'solar:archive-minimalistic-line-duotone',
  //   iconName: 'carbon:category',
  //   route: '/scoring-root-category',
  //   permissionCheck:true,
  //   roles:['1','2']
  // },
  // {
  //   displayName: 'Scoring Category',
  //   // iconName: 'solar:archive-minimalistic-line-duotone',
  //   iconName: 'carbon:category',
  //   route: '/scoring-category',
  //   permissionCheck:true,
  //   roles:['1','2']
  // },
  
  // {
  //   displayName: 'Role Rights',
  //   navCap: 'Manage Role Rights',
  //   permissionCheck:false,
  // },
  // {
  //   displayName: 'Role Rights',
  //   // iconName: 'solar:archive-minimalistic-line-duotone',
  //   iconName: 'hugeicons:configuration-02',
  //   route: '/role-rights',
  //   permissionCheck:false,
  // },

  // {
  //   navCap: 'Ui Components',
  //   divider: true
  // },
  // {
  //   displayName: 'Badge',
  //   iconName: 'solar:archive-minimalistic-line-duotone',
  //   route: '/ui-components/badge',
  // },
  // {
  //   displayName: 'Chips',
  //   iconName: 'solar:danger-circle-line-duotone',
  //   route: '/ui-components/chips',
  // },
  // {
  //   displayName: 'Lists',
  //   iconName: 'solar:bookmark-square-minimalistic-line-duotone',
  //   route: '/ui-components/lists',
  // },
  // {
  //   displayName: 'Menu',
  //   iconName: 'solar:file-text-line-duotone',
  //   route: '/ui-components/menu',
  // },
  // {
  //   displayName: 'Tooltips',
  //   iconName: 'solar:text-field-focus-line-duotone',
  //   route: '/ui-components/tooltips',
  // },
  // {
  //   displayName: 'Forms',
  //   iconName: 'solar:file-text-line-duotone',
  //   route: '/ui-components/forms',
  // },
  // {
  //   displayName: 'Tables',
  //   iconName: 'solar:tablet-line-duotone',
  //   route: '/ui-components/tables',
  // },
  // {
  //   navCap: 'Auth',
  //   divider: true
  // },
  // {
  //   displayName: 'Login',
  //   iconName: 'solar:login-3-line-duotone',
  //   route: '/authentication/login',
  // },
  // {
  //   displayName: 'Register',
  //   iconName: 'solar:user-plus-rounded-line-duotone',
  //   route: '/authentication/register',
  // },
  // {
  //   navCap: 'Extra',
  //   divider: true
  // },
  // {
  //   displayName: 'Icons',
  //   iconName: 'solar:sticker-smile-circle-2-line-duotone',
  //   route: '/extra/icons',
  // },
  // {
  //   displayName: 'Sample Page',
  //   iconName: 'solar:planet-3-line-duotone',
  //   route: '/extra/sample-page',
  // },
];
