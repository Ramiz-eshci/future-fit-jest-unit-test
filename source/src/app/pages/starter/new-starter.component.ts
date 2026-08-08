import { Component, OnInit, ViewChild, ViewEncapsulation, QueryList, ElementRef, ViewChildren } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { AppNewCustomersComponent } from 'src/app/components/new-customers/new-customers.component';
import { AppTotalIncomeComponent } from 'src/app/components/total-income/total-income.component';
import { AppDailyActivitiesComponent } from 'src/app/components/daily-activities/daily-activities.component';
import { AppBlogCardsComponent } from 'src/app/components/blog-card/blog-card.component';
import { AppRevenueProductComponent } from 'src/app/components/revenue-product/revenue-product.component';
import { AppRevenueForecastComponent } from 'src/app/components/revenue-forecast/revenue-forecast.component';
import { CommonService } from 'src/app/services/common.service';
import { UserService } from 'src/app/services/user.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexChart,
  ApexLegend,
  ChartComponent,
  ApexAxisChartSeries,
  ApexXAxis,
  ApexStroke,
  ApexDataLabels,
  ApexYAxis,
  ApexTooltip,
  ApexTitleSubtitle,
  NgApexchartsModule,
  ApexOptions
} from 'ng-apexcharts';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import introJs from 'intro.js';
import { TourService } from 'src/app/services/tour.service';

import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { ChartCardComponent } from 'src/app/components/widget/chart-data/chart-card/chart-card.component';

interface ChartItem {
  type: string;
  collapsed: boolean;
  dataType: string;
  filterValue: any;
  filterLabel: string;
  isDefault: boolean;
}

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
};

export type ChartOptions2 = ApexOptions & {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  colors: string[];
  title: ApexTitleSubtitle;
  subtitle: ApexTitleSubtitle;

};

interface ResidualRisk {
  id: string;
  name: string;
  score_start_range: number;
  score_end_range: number;
  color_code: string;
}
@Component({
  selector: 'app-starter',
  standalone: true,
  imports: [
    MaterialModule,
    AppNewCustomersComponent,
    AppTotalIncomeComponent,
    AppDailyActivitiesComponent,
    AppBlogCardsComponent,
    AppRevenueProductComponent,
    AppRevenueForecastComponent,
    CommonModule,
    RouterModule,
    NgApexchartsModule,
    FormsModule,
    ReactiveFormsModule,
    ChartCardComponent
  ],
  templateUrl: './new-starter.component.html',
  styleUrls: ['./starter.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class NewStarterComponent implements OnInit {
  @ViewChild('drawer') drawer!: MatSidenav;
  @ViewChildren('cardElement') cardElements!: QueryList<ElementRef>;

  chartTypes = [
    { type: 'Bar', icon: 'bar_chart' },
    { type: 'Pie', icon: 'pie_chart' },
    { type: 'Line', icon: 'show_chart' },
    { type: 'Donut', icon: 'donut_large' }
  ];
  dataTypes = [
    { type: 'be_filled', label: 'Be Froms Filled' },
    { type: 'user_forms', label: 'User Forms' },
    // { type: 'gross_total', label: 'Gross Total' },
    // { type: 'complince_score', label: 'Compliance Score' },
    // { type: 'be_filled', label: 'Effectiveness' },
    // { type: 'be_filled_residual', label: 'Effectiveness Residual' },
    // { type: 'risk_descriptor', label: 'Risk Descriptor' }
  ];



  totalCompanies: any = 0;
  totalSites: any = 0;
  totalEmployees: any = 0;
  totalProducts: any = 0;
  RoleID: any = 1;
  CompanyID: any = 0;
  previousScrollY = 0;
  selectedChart: string | null = null;
  selectedDataObject: any = []
  selectedDataType: string | null = null;
  riskOwners: any = []
  sep :any []
  descriptors: any = []
  chartList: ChartItem[] = [];
  activeGroup: string = 'site';
  Sites: any = [];
  employees: any = [];
  products: any = [];
  hoverIndex: number | null = null;
  calculationInputClass: any = ['gray', 'orange', 'blue', 'green'];
  tooltipStyle: any = {};
  progressIndicators: any = 0;

  constructor(public commonService: CommonService,
    public userService: UserService,
    private fb: FormBuilder,
    private tourService: TourService
  ) {


    this.RoleID = this.userService.RoleID
    this.CompanyID = this.userService.CompanyID

    if (this.RoleID != 1) {
      this.chartList.push({
        type: 'Pie',
        dataType: 'be_filled',
        filterValue: 1,
        filterLabel: 'Be Froms Filled',
        collapsed: false,
        isDefault: true
      });
      this.chartList.push({
        type: 'Donut',
        dataType: 'user_forms',
        filterValue: 0,
        filterLabel: 'User Be Forms',
        collapsed: false,
        isDefault: true
      });
    }

    // this.commonService.getData('be-form/getAllBE2').subscribe((response) => {
    //   if (response.status === true) {
    //     const data = response.data;

    //     // Store grouped data
    //     // this.site = data.sites;
    //     // this.employees = data.employees;
    //     // this.products = data.products;

    //     // For default sidebar, load Sites first
    //     // this.BEData = data;

    //     this.Sites = data.sites;
    //     console.log(this.Sites[0].ProgressIndicators, 'Sitess Data')

    //     this.employees = data.employees;

    //     this.products = data.products;


    //   }
    // });
    this.commonService.getData('reports/report/' + this.CompanyID).subscribe((response) => {
      if (response.status === true) {
        const data = response.data;
        this.Sites = data.sites;
        console.log(this.Sites[0].ProgressIndicators, 'Sitess Data')

        this.employees = data.employees;

        this.products = data.products;


      }
    });
    this.sep = [
        {
            "id": 1,
            "name": "Site",
        },
        {
            "id": 2,
            "name": "Employee",
        },
        {
            "id": 3,
            "name": "Product",
        }
    ]



  }

  onHover(index: number, element: HTMLElement) {
    this.hoverIndex = index;

    const rect = element.getBoundingClientRect();
    const tooltipWidth = 750;
    const screenWidth = window.innerWidth;

    let left = '50%';
    let transform = 'translateX(-50%)';

    if (rect.left < tooltipWidth / 2) {
      left = '0';
      transform = 'translateX(0)';
    } else if (screenWidth - rect.right < tooltipWidth / 2) {
      left = '100%';
      transform = 'translateX(-100%)';
    }

    this.tooltipStyle = { left, transform };
  }

  getTooltipStyle(index: number): any {
    // If it's the first item, shift tooltip more to the right
    if (index === 4) {
      return {
        left: '20%',
        transform: 'translateX(0%)',
      };
    }
    return {
      left: '50%',
      transform: 'translateX(-50%)',
    };
  }

  getShortGoalName(fullName: string, wordLimit: number = 3): string {
    const words = fullName.split(' ');
    if (words.length <= wordLimit) {
      return fullName;
    }
    return words.slice(0, wordLimit).join(' ') + '...';
  }



  // prestartTour() {
  //   const intro = introJs();

  //   intro.setOptions({
  //     steps: [
  //       // {
  //       //   intro: 'Welcome to Future Fit! Let’s take a quick tour.'
  //       // },
  //       {
  //         element: document.querySelector('#tour-button1') as HTMLElement,
  //         intro: 'Click here to get started',
  //       },
  //       // {
  //       //   element: document.querySelector('#site-list') as HTMLElement,
  //       //   intro: 'Here you’ll see all the sites you’ve added.'
  //       // }
  //     ],
  //     // showProgress: true,
  //     showBullets: false,
  //     tooltipPosition: 'auto',
  //     // scrollToElement: true,
  //     disableInteraction: true,
  //     // nextLabel: 'Next →',
  //     // prevLabel: '← Back',
  //     // skipLabel: 'Skip Tour',
  //     // doneLabel: 'Got It!'
  //   });

  //   intro.start();
  // }


  // new charts starts here

  openDrawer() {

    document.body.style.overflow = 'hidden';
    this.previousScrollY = window.scrollY;
    this.drawer.open().then(() => {

      const el = document.querySelector('.mat-typography');
      console.log(el, 'el')
      setTimeout(() => {

        if (el) {
          el.scrollTo({ top: 0, behavior: 'smooth' }); // scroll to top
          // OR scroll to bottom:
          el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        }
      }, 2000);
    });
  }

  onOpened() {
    window.scroll(0, 0)
  }

  closeSidebar(drawer: any) {
    this.selectedChart = null;
    this.selectedDataType = null;
    this.selectedDataObject = null;
    drawer.close();
  }

  requiresSelection(type: string | null): boolean {
    // Define all types that do NOT require selection
    const noSelectionRequiredTypes = ['user_forms'];

    // If the type is in the list, selection is NOT required
    return !noSelectionRequiredTypes.includes(type || '');
  }

  addChart(type: string | null, drawer: any) {
    console.log(drawer, 'drawer')
    // const isStaticType = this.selectedDataType === 'bra_status';
    // New static data types can be added here
    // const staticDataTypes = ['bra_status', 'gross_total', 'residual_risk', 'overall_score'];
    // const isStaticType = staticDataTypes.includes(this.selectedDataType || '');
    // const value = isStaticType
    //   ? { id: null, name: 'All Statuses' }
    //   : this.selectedDataObject;
    const staticDataTypes: Record<string, string> = {
      user_forms: 'User Forms',
    };

    const isStaticType = Object.keys(staticDataTypes).includes(this.selectedDataType || '');
    // console.log(this.selectedDataType, 'this.selectedDataType')
    // console.log(isStaticType, 'isStaticType')
    const value = isStaticType
      ? { id: null, name: staticDataTypes[this.selectedDataType!] || 'All' }
      : this.selectedDataObject;

    const needsSelection = this.requiresSelection(this.selectedDataType);
    // console.log(value,'-----value')

    if (!type || !this.selectedDataType || (!isStaticType && !value)) return;
    if (needsSelection && !value) return;
    const newChart = {
      type,
      dataType: this.selectedDataType!, // e.g. 'owner'
      filterValue: value.id,
      filterLabel: value.name,
      collapsed: false,
      isDefault: false
    };
    // console.log(newChart,'newChart')
    this.chartList.push(newChart);

    // this.commonService.addData('report/save_user_dashboard_report', newChart).subscribe(
    //   response => {
    //     if (response.status === true) {
    //       // console.log(response.data.insertId);
    //       // this.company_tarr_id = response.data.insertId;
    //       // console.log('company_tarr_id :', this.company_tarr_id);
    //       // this.location.replaceState('/bra/add/' + this.company_tarr_id);
    //     }
    //   },
    //   error => {
    //     console.error('An error occurred:', error);
    //   }
    // );

    this.selectedChart = null;
    this.selectedDataType = null;
    this.selectedDataObject = null;
    drawer.close();
  }

  ngOnInit() {
    // this.prestartTour(); // Call the pre-tour method to show initial instructions
    this.tourService.startTour$.subscribe(() => {
      this.startTour(); // Call your original method here
    });
  }

  startTour() {
    const intro = introJs();

    intro.setOptions({
      steps: [
        {
          intro: `
          <div style="text-align: center;">
            <div style="font-size: 24px; margin-bottom: 8px;">🚀 Welcome to Future Fit!</div>
            <p>Let's take a quick tour of your dashboard</p>
          </div>
        `,
          // position: 'center'
        },
        {
          element: document.querySelector('#sidebar-site-item') as HTMLElement,
          intro: 'Start by adding your first <strong>site location</strong>',
          position: 'right'
        },
        {
          element: document.querySelector('#sidebar-employee-item') as HTMLElement,
          intro: 'Next, add <strong>employees</strong>',
          position: 'right'
        },
        {
          element: document.querySelector('#sidebar-product-item') as HTMLElement,
          intro: 'Add <strong>products</strong> to complete your business setup.',
          position: 'right'
        },
        {
          element: document.querySelector('#sidebar-be-form-item') as HTMLElement,
          intro: 'Once you\'ve added sites, employees & products, you can start filling out <strong>BE forms</strong>.',
          position: 'right'
        },
        {
          element: document.querySelector('#sidebar-user-item') as HTMLElement,
          intro: 'Invite your <strong>associates</strong>',
          position: 'right'
        }
      ],
      showProgress: true,
      showBullets: true,
      tooltipPosition: 'auto',
      scrollToElement: true,
      disableInteraction: true,
      nextLabel: 'Next →',
      prevLabel: '← Back',
      doneLabel: 'Finish Tour',
      hidePrev: true, // Hide back button on first step
      highlightClass: 'tour-highlight', // Custom highlight class
      exitOnOverlayClick: false,
      keyboardNavigation: true,
      overlayOpacity: 0.5,
      helperElementPadding: 5
    });

    // Add some events for better UX
    intro.oncomplete(() => {
      console.log('Tour completed');
      // You could add a completion effect here
    });

    intro.onexit(() => {
      console.log('Tour exited');
    });

    intro.start();
  }

  toggleCollapse(index: number) {
    this.chartList[index].collapsed = !this.chartList[index].collapsed;
  }

}
