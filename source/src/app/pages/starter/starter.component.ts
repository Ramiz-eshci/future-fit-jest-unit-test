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
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats, MatOptionModule } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatDialog } from '@angular/material/dialog';
import { TemplateRef } from '@angular/core';

export const MY_DATE_FORMATS: MatDateFormats = {
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
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  templateUrl: './starter.component.html',
  styleUrls: ['./starter.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class StarterComponent implements OnInit {
  @ViewChild('drawer') drawer!: MatSidenav;
  @ViewChildren('cardElement') cardElements!: QueryList<ElementRef>;
  @ViewChild('chartDialog') chartDialog!: TemplateRef<any>;
  chartTypes = [
    { type: 'Bar', icon: 'bar_chart' },
    { type: 'Pie', icon: 'pie_chart' },
    { type: 'Line', icon: 'show_chart' },
    { type: 'Donut', icon: 'donut_large' }
  ];
  dataTypes = [
    { type: 'be_filled', label: 'BE Form ' },
    { type: 'user_forms', label: 'User BE Forms' },


  ];

  BE04Report: boolean = false;
  BE23Report: boolean = false;
  totalCompanies: any = 0;
  totalSites: any = 0;
  totalEmployees: any = 0;
  totalProducts: any = 0;
  RoleID: any = 1;
  CompanyID: any = 0;
  UserID: any = 0;
  previousScrollY = 0;
  selectedChart: string | null = null;
  selectedDataObject: any = []
  selectedDataType: string | null = null;
  riskOwners: any = []
  sep: any[]
  descriptors: any = []
  chartList: ChartItem[] = [];
  activeGroup: string = 'site';
  Sites: any = [];
  SitesDetails: any = [];
  EmployeeDetails: any = [];
  ProductsDetails: any = [];
  employees: any = [];
  products: any = [];
  goverance: any = [];
  // hoverIndex: number | null = null;
  calculationInputClass: any = ['gray', 'orange', 'blue', 'green'];
  tooltipStyle: any = {};
  progressIndicators: any = 0;
  reportLoaded = false;
  siteDetailsLoaded = false;
  employeeDetailsLoaded = false;
  isChartLoading = false;
  productDetailsLoaded = false;
  hoverIndex: number = -1;
  hoverText: string = '';
  hoverSubIndex: number = -1;
  beGoals: any = []
  // selectedYear: number = new Date().getFullYear();
  availableYears: number[] = [];
  selectedYear: Date | null = null;
  be04ChartOptions: ChartOptions2 = {
    series: [{ name: '', data: [] }],
    chart: { type: 'bar', height: 350 },
    xaxis: { categories: [] },
    plotOptions: { bar: { horizontal: true } },
    dataLabels: { enabled: false },
    colors: [],
    tooltip: {},
    title: { text: '' },
    stroke: {},
    yaxis: {},
    subtitle: {}
  };
  be23ChartOptions: ChartOptions2 = {
    series: [{ name: '', data: [] }],
    chart: { type: 'bar', height: 350 },
    xaxis: { categories: [] },
    plotOptions: { bar: { horizontal: true } },
    dataLabels: { enabled: false },
    colors: [],
    tooltip: {},
    title: { text: '' },
    stroke: {},
    yaxis: {},
    subtitle: {}
  };

  allCategories = [
    'Energy',
    'Water',
    'Natural Resource',
    'Pollution (GHGs)',
    'Pollution (Harmful emission)',
    'Waste',
    'Physical Presence',
    'People',
    'Driver',
  ];
  allYearsData: any[] = [];
  // be01ChartOptions: any;
  // be01ContextUnit: string = '';
  // chartTitle = '';
  chartTitle = '';
  contextUnit = '';
  chartOptions: any;
  constructor(public commonService: CommonService,
    public userService: UserService,
    private fb: FormBuilder,
    private tourService: TourService,
    private dialog: MatDialog
  ) {


    this.RoleID = this.userService.RoleID
    this.CompanyID = this.userService.CompanyID
    this.UserID = this.userService.UserID

    if (this.RoleID != 1) {
      this.chartList.push({
        type: 'Pie',
        dataType: 'be_filled',
        filterValue: 0,
        filterLabel: 'BE Form ',
        collapsed: false,
        isDefault: true
      });
      this.chartList.push({
        type: 'Donut',
        dataType: 'user_forms',
        filterValue: 0,
        filterLabel: 'User BE Forms',
        collapsed: false,
        isDefault: true
      });
    }
    this.commonService.getData('users/getbyId/' + this.UserID).subscribe((response) => {
      if (response.status === true) {
        if (response.data[0]) {
          this.beGoals = response.data[0].goal_ids


          console.log(this.beGoals)

          if (this.beGoals.some((id: number) => id >= 1 && id <= 9 && id != 4)) {
            this.activeGroup = 'site';
          } else if (this.beGoals.some((id: number) => id == 4)) {
            this.activeGroup = 'supplychain';
          }
          else if (this.beGoals.some((id: number) => id >= 10 && id <= 14)) {
            this.activeGroup = 'employee';
          }
          else if (this.beGoals.some((id: number) => id >= 15 && id <= 19)) {
            this.activeGroup = 'product';
          }
          else if (this.beGoals.some((id: number) => id >= 20 && id <= 23)) {
            this.activeGroup = 'goverance';
          }
        }
      }
    });

    if (this.RoleID == 1) {
      this.commonService.getData('reports/admin-dashboard-data').subscribe((response) => {
        if (response.status === true) {
          const data = response.data;
          this.totalCompanies = data.totalCompanies;
          this.totalSites = data.totalSites;
          this.totalEmployees = data.totalEmployee;
          this.totalProducts = data.totalProduct;
        }
      });
    }

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

  onYearSelected(event: any, datepicker: any): void {
    let selectedYear: number;
    this.isChartLoading = true;
    if (event?._isAMomentObject && typeof event.year === 'function') {
      selectedYear = event.year();
    }
    else if (event instanceof Date) {
      selectedYear = event.getFullYear();
    }
    else if (typeof event === 'number') {
      selectedYear = event;
    }
    else {
      console.error("Unexpected value in year picker:", event);
      return;
    }

    this.selectedYear = new Date(selectedYear, 0, 1);



    this.loadDataByYear(selectedYear);

    datepicker.close();
  }

  ngOnInit() {
    const currentYear = new Date().getFullYear();

    this.selectedYear = new Date(currentYear, 0, 1);

    this.loadDataByYear(currentYear);

    this.tourService.startTour$.subscribe(() => {
      this.startTour();
    });

  }

  getYear(value: any): number {
    if (!value) return 0;
    return value instanceof Date ? value.getFullYear() : +value || 0;
  }

  loadDataByYear(year: number): void {
    this.isChartLoading = true;
    this.commonService.getData('reports/report/' + this.CompanyID).subscribe((response) => {
      if (response.status === true) {
        const data = response.data;
        const be04Site = data.sites.find((site: any) => site.goal_code === 'BE04');
        this.BE04Report = data.sites.find((site: any) => site.goal_code === 'BE04');
        // this.BE23Report = data.products.find((site: any) => site.goal_code === 'BE23');
        this.BE23Report = data.Governance.find((site: any) => site.goal_code === 'BE23');
        this.Sites = data.sites
          .filter((site: any) => site.goal_code !== 'BE04')
          .map((site: any) => ({
            ...site,
            progress_indicators:
              site.progress_indicators?.filter((p: any) => this.getYear(p.year) == year) || [],
            context_indicators:
              site.context_indicators?.filter((c: any) => this.getYear(c.year) == year) || [],
          }));
        this.updateBE04Chart(be04Site, year);
        setTimeout(() => {
          this.isChartLoading = false;
        }, 500);
        this.employees = data.employees.map((emp: any) => {
          return {
            ...emp,
            progress_indicators: emp.progress_indicators?.filter((p: any) => this.getYear(p.year) == year) || [],
            context_indicators: emp.context_indicators?.filter((c: any) => this.getYear(c.year) == year) || []
          };
        });

        this.goverance = data.Governance
          .filter((emp: any) => emp.goal_code !== 'BE23')
          .map((emp: any) => {
            return {
              ...emp,
              progress_indicators: emp.progress_indicators?.filter((p: any) => this.getYear(p.year) == year) || [],
              context_indicators: emp.context_indicators?.filter((c: any) => this.getYear(c.year) == year) || []
            };
          });
        console.log(this.goverance, 'this.goverance')
        const be23Product = data.Governance.find((prod: any) => prod.goal_code === 'BE23');
        console.log(be23Product, 'be23Product')
        this.products = data.products
          .filter((prod: any) => prod.goal_code !== 'BE23')
          .map((prod: any) => ({
            ...prod,
            progress_indicators:
              prod.progress_indicators?.filter((p: any) => this.getYear(p.year) == year) || [],
            context_indicators:
              prod.context_indicators?.filter((c: any) => this.getYear(c.year) == year) || [],
          }));
        this.updateBE23Chart(be23Product, year);
        setTimeout(() => {
          this.isChartLoading = false;
        }, 200);
        this.reportLoaded = true;


        if (this.siteDetailsLoaded) {
          this.updateBE01Score();
          this.updateBE02Score();
          this.updateBE03Score();
          this.updateBE05Score();
          this.updateBE06Score();
          this.updateBE07Score();
          this.updateBE08Score();
          this.updateBE09Score();

        }

        if (this.employeeDetailsLoaded) {
          this.updateBE10Score();
          this.updateBE11Score();
          this.updateBE12Score();
          this.updateBE13Score();
          this.updateBE14Score();
          this.updateBE20Score();
        }
        if (this.productDetailsLoaded) {
          this.updateBE15Score()
          this.updateBE16Score()
          this.updateBE18Score();
          this.updateBE17Score();
          this.updateBE19Score();
          this.updateBE21Score();
          this.updateBE22Score();
        }
      }
    });

    this.commonService.getData('be-listing/getSiteDetailsCompany/' + year).subscribe((response) => {
      if (response.success === true) {
        this.SitesDetails = response.data.sites;
        this.siteDetailsLoaded = true;

        if (this.reportLoaded) {
          this.updateBE01Score();
          this.updateBE02Score();
          this.updateBE03Score();
          this.updateBE05Score();
          this.updateBE06Score();
          this.updateBE07Score();
          this.updateBE08Score();
          this.updateBE09Score();
          this.updateBE21Score();
          this.updateBE22Score();


        }


      }
    });

    this.commonService.getData('be-listing/getEmployeeDetailsCom/' + year).subscribe((response) => {
      if (response.success === true) {
        this.EmployeeDetails = response.data.employees;
        this.employeeDetailsLoaded = true;

        if (this.reportLoaded) {
          this.updateBE10Score();
          this.updateBE11Score();
          this.updateBE12Score();
          this.updateBE13Score();
          this.updateBE14Score();
          this.updateBE20Score();
        }
      }
    });


    this.commonService.getData('be-listing/getProductDetailsCom/' + year).subscribe((response) => {

      if (response.success === true) {
        this.ProductsDetails = response.data.products;
        this.productDetailsLoaded = true;

        if (this.reportLoaded) {
          this.updateBE15Score();
          this.updateBE16Score();
          this.updateBE18Score();
          this.updateBE17Score();
          this.updateBE19Score();
          this.updateBE21Score();
          this.updateBE22Score();
        }

      }
    });
    this.isChartLoading = false;
  }


  openSiteChart(beCode: string) {
    this.commonService
      .getData(`be-listing/getSiteDetailsCompanyAllYears/${beCode}`)
      .subscribe((response: any) => {
        if (response.success) {
          this.allYearsData = response.data.beData;
          this.contextUnit = response.data.context_indicator?.unit || '';
          let goal;
          //   this.Sites.find((x: any) => x.goal_code === beCode)
          if (['BE21', 'BE22'].includes(beCode)) {
            goal = this.goverance.find((x: any) => x.goal_code === beCode);
          } else {
            goal = this.Sites.find((x: any) => x.goal_code === beCode);
          }
          this.chartTitle = `${beCode} - ${goal?.goal_short_name || ''} - Annual Progress Trajectory`;
          switch (beCode) {
            case 'BE01':
              this.prepareBE01Chart();
              break;
            case 'BE02':
              this.prepareBE02Chart();
              break;
            case 'BE03':
              this.prepareBE03Chart();
              break;
            case 'BE05':
              this.prepareBE05Chart();
              break;

            case 'BE06':
              this.prepareBE06Chart();
              break;

            case 'BE07':
              this.prepareBE07Chart();
              break;

            case 'BE08':
              this.prepareBE08Chart();
              break;
            case 'BE09':
              this.prepareBE09Chart();
              break;

            case 'BE21':
              this.prepareBE21Chart();
              break;

            case 'BE22':
              this.prepareBE22Chart();
              break;

            default:
              return;
          }

          const dialogRef = this.dialog.open(
            this.chartDialog,
            {
              width: '900px',
              maxWidth: '95vw'
            }
          );

          dialogRef.afterOpened().subscribe(() => {
            window.dispatchEvent(new Event('resize'));
          });

        }

      });

  }

  prepareBE01Chart() {
    const years = [...new Set(this.allYearsData.map(x => Number(x.year)))].sort((a, b) => a - b);
    const scores = years.map(year => this.calculateProgressIndicatorBE01ByYear(year));
    const contextData = years.map(year => this.calculateContextIndicatorBE01ByYear(year));
    this.chartOptions = {
      series: [
        {
          name: 'Progress Indicator',
          type: 'line',
          data: scores,
          color: '#0B6FA4'
        },
        {
          name: 'Context Indicator',
          type: 'column',
          data: contextData,
          color: '#ED7D31'
        }
      ],

      chart: {
        type: 'line',
        height: 350,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },

      stroke: {
        width: [4, 0],
        curve: 'straight'
      },
      colors: ['#0B6FA4'],
      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },
      yaxis: [
        {
          min: 0,
          max: 100,
          tickAmount: 10,
          title: {
            text: 'Progress Indicator (%)'
          },
          labels: {
            formatter: function (val: number) {
              return val + '%';
            }
          }
        },
        {
          opposite: true,
          title: {
            text: 'Context Indicator'
          },
          labels: {
            offsetX: -10,
            formatter: function (val: number) {
              return Number(val).toLocaleString();
            }
          }
        }
      ],
      legend: {
        position: 'bottom'
      },

      dataLabels: {
        enabled: false
      }
    };

  }
  calculateProgressIndicatorBE01ByYear(
    year: number
  ): number {
    let totalRenewable = 0;
    let totalEnergy = 0;
    const yearData =
      this.allYearsData.filter(
        x => +x.year == +year
      );
    yearData.forEach((entry: any) => {
      totalRenewable +=
        +entry.amount_of_renewable_energy_used || 0;
      totalEnergy +=
        +entry.total_amount_of_energy_used || 0;
    });

    if (totalEnergy == 0) {
      return 0;
    }
    return Math.round(
      (totalRenewable / totalEnergy) * 100
    );

  }
  calculateContextIndicatorBE01ByYear(
    year: number
  ): number {

    let totalEnergy = 0;

    const yearData =
      this.allYearsData.filter(
        x => +x.year == +year
      );

    yearData.forEach((entry: any) => {

      totalEnergy +=
        +entry.total_amount_of_energy_used || 0;

    });

    return totalEnergy;

  }

  prepareBE02Chart() {

    const years = [
      ...new Set(
        this.allYearsData.map(x => Number(x.year))
      )
    ].sort((a, b) => a - b);

    const waterConsumption = years.map(year =>
      this.calculateProgressIndicatorBE02ByYear(0, year)
    );

    const waterDischarge = years.map(year =>
      this.calculateProgressIndicatorBE02ByYear(1, year)
    );

    const fitSources = years.map(year =>
      this.calculateContextIndicatorBE02ByYear(0, year)
    );

    const unfitSources = years.map(year =>
      this.calculateContextIndicatorBE02ByYear(1, year)
    );

    const totalDischarged = years.map(year =>
      this.calculateContextIndicatorBE02ByYear(2, year)
    );
    

    this.chartOptions = {

      series: [

        {
          name: 'Water Consumption Fit sources',
          type: 'column',
          data: fitSources,
          color: '#2E7D32'
        },

        {
          name: 'Water Consumption Unfit sources',
          type: 'column',
          data: unfitSources,
          color: '#29B6F6'
        },

        {
          name: 'Total water discharged',
          type: 'column',
          data: totalDischarged,
          color: '#8E24AA'
        },

        {
          name: 'Water Consumption',
          type: 'line',
          data: waterConsumption,
          color: '#1565C0'
        },

        {
          name: 'Water Discharge',
          type: 'line',
          data: waterDischarge,
          color: '#EF6C00'
        }

      ],

      chart: {
        type: 'line',
        height: 430,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },

      stroke: {
        width: [0, 0, 0, 3, 3],
        curve: 'straight'
      },

      plotOptions: {
        bar: {
          columnWidth: '35%'
        }
      },

      markers: {
        size: [0, 0, 0, 4, 4]
      },

      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },

      yaxis: [

        {
          seriesName: ['Water Consumption', 'Water Discharge'],
          min: 0,
          max: 100,
          tickAmount: 5,
          title: {
            text: 'Progress Indicator (%)'
          },
          labels: {
            formatter: (val: number) => val + '%'
          }
        },

        {
          seriesName: [
            'Water Consumption Fit sources',
            'Water Consumption Unfit sources',
            'Total water discharged'
          ],
          opposite: true,
          title: {
            text: 'Context Indicator'
          },
          labels: {
            formatter: (val: number) =>
              Number(val).toLocaleString()
          }
        }

      ],

      tooltip: {

        shared: true,

        y: {

          formatter: (value: number, opts: any) => {

            const seriesName =
              opts.w.config.series[opts.seriesIndex].name;

            if (
              seriesName === 'Water Consumption' ||
              seriesName === 'Water Discharge'
            ) {
              return value + '%';
            }

            return (
              Number(value).toLocaleString()

            );

          }

        }

      },

      legend: {
        position: 'bottom'
      },

      dataLabels: {
        enabled: false
      }

    };

  }
  calculateProgressIndicatorBE02ByYear(
    index: number,
    year: number
  ): number {

    let numerator = 0;
    let denominator = 0;

    const yearData = this.allYearsData.filter(
      x => +x.year === +year
    );

    yearData.forEach((entry: any) => {

      // Water Consumption
      if (index === 0 && +entry.relevance_id === 1) {

        numerator += +entry.commercial_water_consumption_fit_source || 0;
        denominator += +entry.total_commercial_water_consumption || 0;

      }

      // Water Discharge
      if (index === 1 && +entry.Relevance_id_2 === 1) {

        numerator += +entry.fit_discharged_water || 0;
        denominator += +entry.total_discharged_water || 0;

      }

    });

    if (denominator === 0) {
      return 0;
    }

    return Math.round((numerator / denominator) * 100);

  }

  calculateContextIndicatorBE02ByYear(
    index: number,
    year: number
  ): number {

    let fitSources = 0;
    let unfitSources = 0;
    let dischargedWater = 0;

    const yearData = this.allYearsData.filter(
      x => +x.year === +year
    );

    yearData.forEach((entry: any) => {

      // Water Consumption Fit Sources
      if (index === 0 && +entry.relevance_id === 1) {

        fitSources +=
          +entry.commercial_water_consumption_fit_source || 0;

      }

      // Water Consumption Unfit Sources
      if (index === 1 && +entry.relevance_id === 1) {

        unfitSources +=
          +entry.commercial_water_consumption_unfit_source || 0;

      }

      // Total Water Discharged
      if (index === 2 && +entry.Relevance_id_2 === 1) {

        dischargedWater +=
          +entry.total_discharged_water || 0;

      }

    });

    switch (index) {

      case 0:
        return fitSources;

      case 1:
        return unfitSources;

      case 2:
        return dischargedWater;

      default:
        return 0;

    }

  }

  calculateProgressIndicatorBE03ByYear(year: number): number {

    let numerator = 0;
    let denominator = 0;

    const yearData = this.allYearsData.filter(
      x => +x.year === +year
    );

    yearData.forEach((entry: any) => {

      if (+entry.relevance_id !== 1) {
        return;
      }

      const resourceValue =
        +entry.value_of_natural_resource || 0;

      const fitness =
        +entry.resource_fitness_percent || 0;

      numerator += fitness * resourceValue;
      denominator += resourceValue;

    });

    if (denominator === 0) {
      return 0;
    }

    return Math.round(numerator / denominator);

  }
  prepareBE03Chart() {

    const years = [
      ...new Set(
        this.allYearsData.map(x => Number(x.year))
      )
    ].sort((a, b) => a - b);

    const progressData = years.map(year =>
      this.calculateProgressIndicatorBE03ByYear(year)
    );

    this.chartOptions = {

      series: [
        {
          name: 'Natural Resources',
          type: 'line',
          data: progressData,
          color: '#1565C0'
        }
      ],

      chart: {
        type: 'line',
        height: 420,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },

      stroke: {
        width: 3,
        curve: 'straight'
      },

      markers: {
        size: 4
      },

      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },

      yaxis: {
        min: 0,
        max: 100,
        tickAmount: 5,
        title: {
          text: 'Progress Indicator (%)'
        },
        labels: {
          formatter: (val: number) => val + '%'
        }
      },

      legend: {
        position: 'bottom'
      },

      tooltip: {
        y: {
          formatter: (val: number) => val + '%'
        }
      },

      dataLabels: {
        enabled: false
      }

    };

  }
  prepareBE06Chart() {
    const years = [...new Set(this.allYearsData.map(x => Number(x.year)))].sort((a, b) => a - b);
    const scores = years.map(year => this.calculateProgressIndicatorBE06ByYear(year));
    const contextData = years.map(year => this.calculateContextIndicatorBE06ByYear(year));
    this.chartOptions = {
      series: [
        {
          name: 'Progress Indicator',
          type: 'line',
          data: scores,
          color: '#0B6FA4'
        },
        {
          name: 'Context Indicator',
          type: 'column',
          data: contextData,
          color: '#ED7D31'
        }
      ],

      chart: {
        type: 'line',
        height: 350,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },

      stroke: {
        width: [4, 0],
        curve: 'straight'
      },
      colors: ['#0B6FA4'],
      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },
      yaxis: [
        {
          min: 0,
          max: 100,
          tickAmount: 10,
          title: {
            text: 'Progress Indicator (%)'
          },
          labels: {
            formatter: function (val: number) {
              return val + '%';
            }
          }
        },
        {
          opposite: true,
          title: {
            text: 'Context Indicator'
          },
          labels: {
            offsetX: -10,
            formatter: function (val: number) {
              return Number(val).toLocaleString();
            }
          }
        }
      ],
      legend: {
        position: 'bottom'
      },

      dataLabels: {
        enabled: false
      }
    };

  }
  calculateProgressIndicatorBE06ByYear(year: number): number {
    let sumGhgReferenceYear = 0;
    let sumGhgReportingYear = 0;
    let sumGhgOffset = 0;

    let relevantInputsCount = 0;
    let allNoGHG = true;

    const yearData = this.allYearsData.filter(
      (x: any) => +x.year == +year
    );

    yearData.forEach((entry: any) => {

      if (+entry.relevance_id == 1) {

        relevantInputsCount++;

        if (+entry.no_ghg_emission_id != 1) {

          allNoGHG = false;

          sumGhgReferenceYear += +entry.ghg_reference_year || 0;
          sumGhgReportingYear += +entry.ghg_reporting_year || 0;
          sumGhgOffset += +entry.ghg_adequately_offset || 0;

        }
      }

    });

    if (relevantInputsCount == 0) {
      return 0;
    }

    if (allNoGHG) {
      return 100;
    }

    if (sumGhgReferenceYear == 0) {
      return 0;
    }

    if (sumGhgReportingYear > sumGhgReferenceYear) {
      return 0;
    }

    const progress =
      ((sumGhgReferenceYear - sumGhgReportingYear + sumGhgOffset)
        / sumGhgReferenceYear) * 100;

    return Math.round(progress);

  }
  calculateContextIndicatorBE06ByYear(
    year: number
  ): number {

    let totalReporting = 0;
    let countNoEmissions = 0;
    let countWithEmissions = 0;

    const yearData = this.allYearsData.filter(
      (x: any) => +x.year == +year
    );

    yearData.forEach((entry: any) => {

      if (+entry.relevance_id == 1) {

        if (+entry.no_ghg_emission_id == 1) {

          countNoEmissions++;

        } else if (+entry.no_ghg_emission_id == 2) {

          countWithEmissions++;
          totalReporting += +entry.ghg_reporting_year || 0;

        }

      }

    });

    if (countNoEmissions > 0 && countWithEmissions == 0) {
      return 0;
    }

    return totalReporting;

  }
  prepareBE07Chart() {
    const years = [...new Set(this.allYearsData.map(x => Number(x.year)))].sort((a, b) => a - b);
    const scores = years.map(year => this.calculateProgressIndicatorBE07ByYear(year));
    const contextData = years.map(year => this.calculateContextIndicatorBE07ByYear(year));
    this.chartOptions = {
      series: [
        {
          name: 'Progress Indicator',
          type: 'line',
          data: scores,
          color: '#0B6FA4'
        },
        {
          name: 'Context Indicator',
          type: 'column',
          data: contextData,
          color: '#ED7D31'
        }
      ],

      chart: {
        type: 'line',
        height: 350,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },

      stroke: {
        width: [4, 0],
        curve: 'straight'
      },
      colors: ['#0B6FA4'],
      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },
      yaxis: [
        {
          min: 0,
          max: 100,
          tickAmount: 10,
          title: {
            text: 'Progress Indicator (%)'
          },
          labels: {
            formatter: function (val: number) {
              return val + '%';
            }
          }
        },
        {
          opposite: true,
          title: {
            text: 'Context Indicator'
          },
          labels: {
            offsetX: -10,
            formatter: function (val: number) {
              return Number(val).toLocaleString();
            }
          }
        }
      ],
      legend: {
        position: 'bottom'
      },

      dataLabels: {
        enabled: false
      }
    };

  }
  calculateProgressIndicatorBE07ByYear(
    year: number
  ): number {

    let refTotal = 0;
    let reportTotal = 0;
    let countRelevant = 0;
    let countNoWaste = 0;

    const yearData = this.allYearsData.filter(
      (x: any) => +x.year == +year
    );

    yearData.forEach((entry: any) => {

      const relevance = +entry.relevance_id;
      const siteAssessedWasteId = +entry.site_assessed_waste_id;
      const reference = +entry.waste_reference_year || 0;
      const reporting = +entry.waste_reporting_year || 0;

      if (relevance == 1) {

        countRelevant++;

        if (siteAssessedWasteId == 1) {
          countNoWaste++;
        }

        refTotal += reference;
        reportTotal += reporting;

      }

    });

    if (countRelevant > 0 && countRelevant == countNoWaste) {
      return 100;
    }

    if (reportTotal > refTotal) {
      return 0;
    }

    if (refTotal == 0) {
      return 0;
    }

    const fitness =
      ((refTotal - reportTotal) / refTotal) * 100;

    return Math.round(fitness);

  }
  calculateContextIndicatorBE07ByYear(
    year: number
  ): number {

    let totalSum = 0;

    const yearData = this.allYearsData.filter(
      (x: any) => +x.year == +year
    );

    yearData.forEach((entry: any) => {

      if (
        +entry.relevance_id == 1 &&
        +entry.site_assessed_waste_id == 2
      ) {

        totalSum += +entry.waste_reporting_year || 0;

      }

    });

    return totalSum;

  }
  prepareBE08Chart() {
    const years = [...new Set(this.allYearsData.map(x => Number(x.year)))].sort((a, b) => a - b);
    const scores = years.map(year => this.calculateProgressIndicatorBE08ByYear(year));
    const contextData = years.map(year => this.calculateContextIndicatorBE08ByYear(year));
    this.chartOptions = {
      series: [
        {
          name: 'Progress Indicator',
          type: 'line',
          data: scores,
          color: '#0B6FA4'
        },
        {
          name: 'Context Indicator',
          type: 'column',
          data: contextData,
          color: '#ED7D31'
        }
      ],

      chart: {
        type: 'line',
        height: 350,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },

      stroke: {
        width: [4, 0],
        curve: 'straight'
      },
      colors: ['#0B6FA4'],
      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },
      yaxis: [
        {
          min: 0,
          max: 100,
          tickAmount: 10,
          title: {
            text: 'Progress Indicator (%)'
          },
          labels: {
            formatter: function (val: number) {
              return val + '%';
            }
          }
        },
        {
          opposite: true,
          title: {
            text: 'Context Indicator'
          },
          labels: {
            offsetX: -10,
            formatter: function (val: number) {
              return Number(val).toLocaleString();
            }
          }
        }
      ],
      legend: {
        position: 'bottom'
      },

      dataLabels: {
        enabled: false
      }
    };

  }
  calculateProgressIndicatorBE08ByYear(
    year: number
  ): number {

    let numerator = 0;
    let denominator = 0;

    const yearData = this.allYearsData.filter(
      (x: any) => +x.year == +year
    );

    yearData.forEach((entry: any) => {

      if (+entry.relevance_id == 1) {

        const siteArea = +entry.site_area || 0;

        const rawFitness =
          entry.site_fitness_percent ?? '0';

        const fitnessPercent =
          parseFloat(
            rawFitness.toString().replace('%', '')
          ) || 0;

        numerator += siteArea * fitnessPercent;
        denominator += siteArea;

      }

    });

    if (denominator == 0) {
      return 0;
    }

    const weightedAverage = numerator / denominator;

    return Math.round(weightedAverage);

  }
  calculateContextIndicatorBE08ByYear(
    year: number
  ): number {

    let totalArea = 0;

    const yearData = this.allYearsData.filter(
      (x: any) => +x.year == +year
    );

    yearData.forEach((entry: any) => {

      if (+entry.relevance_id == 1) {

        totalArea += +entry.site_area || 0;

      }

    });

    return totalArea;

  }
  prepareBE21Chart() {
    const years = [...new Set(this.allYearsData.map(x => Number(x.year)))].sort((a, b) => a - b);
    const scores = years.map(year => this.calculateProgressIndicatorBE21ByYear(year));
    const contextData = years.map(year => this.calculateContextIndicatorBE21ByYear(year));
    this.chartOptions = {
      series: [
        {
          name: 'Progress Indicator',
          type: 'line',
          data: scores,
          color: '#0B6FA4'
        },
        {
          name: 'Context Indicator',
          type: 'column',
          data: contextData,
          color: '#ED7D31'
        }
      ],

      chart: {
        type: 'line',
        height: 350,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },

      stroke: {
        width: [4, 0],
        curve: 'straight'
      },
      colors: ['#0B6FA4'],
      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },
      yaxis: [
        {
          min: 0,
          max: 100,
          tickAmount: 10,
          title: {
            text: 'Progress Indicator (%)'
          },
          labels: {
            formatter: function (val: number) {
              return val + '%';
            }
          }
        },
        {
          opposite: true,
          title: {
            text: 'Context Indicator'
          },
          labels: {
            offsetX: -10,
            formatter: function (val: number) {
              return Number(val).toLocaleString();
            }
          }
        }
      ],
      legend: {
        position: 'bottom'
      },

      dataLabels: {
        enabled: false
      }
    };

  }

  calculateProgressIndicatorBE21ByYear(year: number): number {

    const yearData = this.allYearsData.filter(
      (x: any) => +x.year == +year
    );

    if (!yearData.length) return 0;

    let totalScore = 0;
    let totalSites = 0;

    const isYes = (val: any): boolean => {
      if (val == null || val == undefined) return false;
      if (typeof val == 'boolean') return val;
      if (typeof val == 'number') return val == 1;
      if (typeof val == 'string') {
        const v = val.trim().toLowerCase();
        return v == 'yes' || v == 'true' || v == '1';
      }
      return false;
    };

    const isNo = (val: any): boolean => {
      if (val == null || val == undefined) return false;
      if (typeof val == 'boolean') return !val;
      if (typeof val == 'number') return val == 0;
      if (typeof val == 'string') {
        const v = val.trim().toLowerCase();
        return v == 'no' || v == 'false' || v == '0';
      }
      return false;
    };

    const group1 = [
      'public_website',
      'public_tax_appointed',
      'public_tax_strategy',
      'public_tax_marketed',
      'public_tax_no_tax'
    ];

    const group2 = [
      'public_tax_direct'
    ];

    const group3 = [
      'public_tax_stated',
      'public_tax_independent',
      'public_tax_discloses'
    ];

    const transparencyFields = [
      'transparency_company',
      'transparency_evidence',
      'transparency_address',
      'transparency_ultimate'
    ];

    const taxRateFields = [
      'taxrate_reconciliation',
      'taxrate_current',
      'taxrate_narrative',
      'taxrate_deferred'
    ];

    yearData.forEach((entry: any) => {

      const isMNC = entry.companyis_mnc;
      const isMNCYes = isYes(isMNC);
      const isMNCNo = isNo(isMNC);

      if (!(isMNCYes || isMNCNo)) return;

      let yesCount = 0;

      [...group1, ...group3].forEach(field => {
        if (isYes(entry[field])) {
          yesCount++;
        }
      });

      if (isMNCYes) {
        group2.forEach(field => {
          if (isYes(entry[field])) {
            yesCount++;
          }
        });
      }

      let transparencyScore = 0;

      transparencyFields.forEach(field => {
        if (isYes(entry[field])) {
          transparencyScore++;
        }
      });

      let taxRateScore = 0;

      taxRateFields.forEach(field => {
        if (isYes(entry[field])) {
          taxRateScore++;
        }
      });

      const divisor = isMNCYes ? 17 : 16;

      const siteScore =
        (yesCount + transparencyScore + taxRateScore) / divisor;

      totalScore += siteScore;
      totalSites++;

    });

    if (totalSites == 0) {
      return 0;
    }

    return Math.round((totalScore / totalSites) * 100);

  }
  calculateContextIndicatorBE21ByYear(year: number): number | string {

    const yearData = this.allYearsData.filter(
      (x: any) => +x.year == +year
    );

    let total = 0;
    let totalSites = 0;

    let hasNACase = false;

    const contextFields = [
      'country_by_disclose',
      'country_by_residence',
      'country_by_net_asset_value',
      'country_by_net_period_provided',
      'country_by_income',
      'country_by_current_tax_charge',
      'country_by_average_number'
    ];

    const isYes = (val: any): boolean => {
      if (val == null || val == undefined) return false;
      if (typeof val == 'boolean') return val;
      if (typeof val == 'number') return val == 1;
      if (typeof val == 'string') {
        const lower = val.trim().toLowerCase();
        return lower == 'yes' || lower == 'true' || val.trim() == '1';
      }
      return false;
    };

    const isNo = (val: any): boolean => {
      if (val == null || val == undefined) return false;
      if (typeof val == 'boolean') return !val;
      if (typeof val == 'number') return val == 0;
      if (typeof val == 'string') {
        const lower = val.trim().toLowerCase();
        return lower == 'no' || lower == 'false' || val.trim() == '0';
      }
      return false;
    };

    yearData.forEach((entry: any) => {

      const isMNC = entry.companyis_mnc;

      if (isNo(isMNC)) {
        hasNACase = true;
        return;
      }

      if (!(isYes(isMNC) || isNo(isMNC))) {
        return;
      }

      let yesCount = 0;

      contextFields.forEach(field => {
        if (isYes(entry[field])) {
          yesCount++;
        }
      });

      total += yesCount / contextFields.length;
      totalSites++;

    });

    if (hasNACase) {
      return 'N/A';
    }

    if (totalSites == 0) {
      return '';
    }

    return Math.round((total / totalSites) * 100);

  }
  prepareBE22Chart() {
    const years = [...new Set(this.allYearsData.map(x => Number(x.year)))].sort((a, b) => a - b);
    const scores = years.map(year => this.calculateProgressIndicatorBE22ByYear(year));
    const contextData = years.map(year => this.calculateContextIndicatorBE22ByYear(year));
    this.chartOptions = {
      series: [
        {
          name: 'Progress Indicator',
          type: 'line',
          data: scores,
          color: '#0B6FA4'
        },
        {
          name: 'Context Indicator',
          type: 'column',
          data: contextData,
          color: '#ED7D31'
        }
      ],

      chart: {
        type: 'line',
        height: 350,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },

      stroke: {
        width: [4, 0],
        curve: 'straight'
      },
      colors: ['#0B6FA4'],
      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },
      yaxis: [
        {
          min: 0,
          max: 100,
          tickAmount: 10,
          title: {
            text: 'Progress Indicator (%)'
          },
          labels: {
            formatter: function (val: number) {
              return val + '%';
            }
          }
        },
        {
          opposite: true,
          title: {
            text: 'Context Indicator'
          },
          labels: {
            offsetX: -10,
            formatter: function (val: number) {
              return Number(val).toLocaleString();
            }
          }
        }
      ],
      legend: {
        position: 'bottom'
      },

      dataLabels: {
        enabled: false
      }
    };

  }
  calculateProgressIndicatorBE22ByYear(year: number): number {

    const yearData = this.allYearsData.filter(
      (x: any) => +x.year == +year
    );

    if (!yearData.length) return 0;

    const isYes = (val: any): boolean => {
      if (val == null) return false;
      if (typeof val == 'boolean') return val;
      if (typeof val == 'number') return val == 1;
      if (typeof val == 'string') {
        const v = val.trim().toLowerCase();
        return v == 'yes' || v == 'true' || v == '1';
      }
      return false;
    };

    const countYes = (obj: any, fields: string[]) =>
      fields.reduce(
        (count, field) => count + (isYes(obj[field]) ? 1 : 0),
        0
      );

    const lobbyingFields = [
      'Lobbying_seek_to_influence',
      'Lobbying_supporting_individuals',
      'Lobbying_specific_positions',
      'Lobbying_all_departments'
    ];

    const contributionFields = [
      'contributions_directly_undertake',
      'contributions_diligence_before',
      'contributions_recipient_engages',
      'contributions_due_diligence',
      'contributions_regular_review',
      'contributions_clear_guidance'
    ];

    const disclosureFields = [
      'disclosure_recipient_name',
      'disclosure_amount',
      'disclosure_date_of_contribution',
      'disclosure_company_raised'
    ];

    let totalScore = 0;
    let totalEntries = 0;

    yearData.forEach((entry: any) => {

      let siteScore = 0;

      const V8 = countYes(entry, lobbyingFields);

      if (V8 == lobbyingFields.length) {

        siteScore = 0.33;

        const X8 = countYes(entry, contributionFields);

        if (X8 == contributionFields.length) {

          siteScore += 0.33;

          const Z8 = countYes(entry, disclosureFields);

          if (Z8 == disclosureFields.length) {
            siteScore += 0.34;
          }
        }
      }

      totalScore += siteScore;
      totalEntries++;

    });

    if (totalEntries == 0) {
      return 0;
    }

    return Math.round((totalScore / totalEntries) * 100);

  }
  calculateContextIndicatorBE22ByYear(year: number): number {
    let total = 0;

    const yearData = this.allYearsData.filter(
      (x: any) => +x.year == +year
    );

    yearData.forEach((entry: any) => {

      const value =
        parseFloat(
          (
            entry.amount_contributed_toLobby || '0'
          ).toString().replace(/,/g, '')
        ) || 0;

      total += value;

    });

    return total;

  }

  calculateProgressIndicatorBE05ByYear(index: number, year: number): number {

    let totalReference = 0;
    let totalReporting = 0;
    let includedWithEmissions = 0;
    let includedNoEmissions = 0;

    const yearData = this.allYearsData.filter(
      x => +x.year === +year
    );

    yearData.forEach((entry: any) => {

      if (index === 0) {

        if (+entry.relevance_id_gaseous === 2) {
          includedNoEmissions++;
        }

        if (+entry.relevance_id_gaseous === 1) {
          includedWithEmissions++;
          totalReference += +entry.gaseous_reference_year || 0;
          totalReporting += +entry.gaseous_reporting_year || 0;
        }

      }

      if (index === 1) {

        if (+entry.relevance_id_liquid === 2) {
          includedNoEmissions++;
        }

        if (+entry.relevance_id_liquid === 1) {
          includedWithEmissions++;
          totalReference += +entry.liquid_reference_year || 0;
          totalReporting += +entry.liquid_reporting_year || 0;
        }

      }

      if (index === 2) {

        if (+entry.relevance_id_solid === 2) {
          includedNoEmissions++;
        }

        if (+entry.relevance_id_solid === 1) {
          includedWithEmissions++;
          totalReference += +entry.solid_reference_year || 0;
          totalReporting += +entry.solid_reporting_year || 0;
        }

      }

    });

    if (includedNoEmissions > 0 && includedWithEmissions === 0) {
      return 100;
    }

    if (totalReference === 0) {
      return 0;
    }

    if (totalReporting > totalReference) {
      return 0;
    }

    return Math.round(
      ((totalReference - totalReporting) / totalReference) * 100
    );

  }

  calculateContextIndicatorBE05ByYear(index: number, year: number): number {

    let totalReporting = 0;
    let includedWithEmissions = 0;
    let includedNoEmissions = 0;

    const yearData = this.allYearsData.filter(
      x => +x.year === +year
    );

    yearData.forEach((entry: any) => {

      if (index === 0) {

        if (+entry.relevance_id_gaseous === 2) {
          includedNoEmissions++;
        }

        if (+entry.relevance_id_gaseous === 1) {
          includedWithEmissions++;
          totalReporting += +entry.gaseous_reporting_year || 0;
        }

      }

      if (index === 1) {

        if (+entry.relevance_id_liquid === 2) {
          includedNoEmissions++;
        }

        if (+entry.relevance_id_liquid === 1) {
          includedWithEmissions++;
          totalReporting += +entry.liquid_reporting_year || 0;
        }

      }

      if (index === 2) {

        if (+entry.relevance_id_solid === 2) {
          includedNoEmissions++;
        }

        if (+entry.relevance_id_solid === 1) {
          includedWithEmissions++;
          totalReporting += +entry.solid_reporting_year || 0;
        }

      }

    });

    if (includedNoEmissions > 0 && includedWithEmissions === 0) {
      return 0;
    }

    return totalReporting;

  }

  prepareBE05Chart() {

    const years = [
      ...new Set(
        this.allYearsData.map(x => Number(x.year))
      )
    ].sort((a, b) => a - b);

    const gaseousProgress = years.map(year =>
      this.calculateProgressIndicatorBE05ByYear(0, year)
    );

    const liquidProgress = years.map(year =>
      this.calculateProgressIndicatorBE05ByYear(1, year)
    );

    const solidProgress = years.map(year =>
      this.calculateProgressIndicatorBE05ByYear(2, year)
    );

    const gaseousContext = years.map(year =>
      this.calculateContextIndicatorBE05ByYear(0, year)
    );

    const liquidContext = years.map(year =>
      this.calculateContextIndicatorBE05ByYear(1, year)
    );

    const solidContext = years.map(year =>
      this.calculateContextIndicatorBE05ByYear(2, year)
    );

    this.chartOptions = {

      series: [

        {
          name: 'Harmful Gaseous Emissions',
          type: 'column',
          data: gaseousContext,
          color: '#2E7D32'
        },

        {
          name: 'Harmful Liquid Emissions',
          type: 'column',
          data: liquidContext,
          color: '#29B6F6'
        },

        {
          name: 'Harmful Solid Emissions',
          type: 'column',
          data: solidContext,
          color: '#8E24AA'
        },

        {
          name: 'Gaseous Emissions',
          type: 'line',
          data: gaseousProgress,
          color: '#1565C0'
        },

        {
          name: 'Liquid Emissions',
          type: 'line',
          data: liquidProgress,
          color: '#EF6C00'
        },

        {
          name: 'Solid Emissions',
          type: 'line',
          data: solidProgress,
          color: '#D81B60'
        }

      ],

      chart: {
        type: 'line',
        height: 430,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },

      stroke: {
        width: [0, 0, 0, 3, 3, 3],
        curve: 'straight'
      },

      markers: {
        size: [0, 0, 0, 4, 4, 4]
      },

      plotOptions: {
        bar: {
          columnWidth: '35%'
        }
      },

      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },

      yaxis: [

        {
          seriesName: [
            'Gaseous Emissions',
            'Liquid Emissions',
            'Solid Emissions'
          ],
          min: 0,
          max: 100,
          tickAmount: 5,
          title: {
            text: 'Progress Indicator (%)'
          },
          labels: {
            formatter: (value: number) => value + '%'
          }
        },

        {
          seriesName: [
            'Harmful Gaseous Emissions',
            'Harmful Liquid Emissions',
            'Harmful Solid Emissions'
          ],
          opposite: true,
          title: {
            text: 'Emissions'
          },
          labels: {
            formatter: (value: number) =>
              Number(value).toLocaleString()
          }
        }

      ],

      tooltip: {

        shared: true,

        y: {

          formatter: (value: number, opts: any) => {

            const seriesName =
              opts.w.config.series[opts.seriesIndex].name;

            switch (seriesName) {

              case 'Gaseous Emissions':
              case 'Liquid Emissions':
              case 'Solid Emissions':
                return value + '%';

              default:
                return Number(value).toLocaleString();

            }

          }

        }

      },

      legend: {
        position: 'bottom'
      },

      dataLabels: {
        enabled: false
      }

    };

  }

  calculateProgressIndicatorBE09ByYear(year: number): number {

    let numerator = 0;
    let denominator = 0;

    const yearData = this.allYearsData.filter(
      x => +x.year === +year
    );

    yearData.forEach((entry: any) => {

      if (
        +entry.relevance_id === 1 &&
        +entry.affected_communities_identified === 1
      ) {

        numerator += +entry.site_fitness_percentage || 0;
        denominator++;

      }

    });

    if (denominator === 0) {
      return 0;
    }

    return Math.round(numerator / denominator);

  }

  calculateContextIndicatorBE09ByYear(
    index: number,
    year: number
  ): number {

    let count = 0;

    const yearData = this.allYearsData.filter(
      x => +x.year === +year
    );

    yearData.forEach((entry: any) => {

      if (+entry.relevance_id !== 1) {
        return;
      }

      if (
        index === 0 &&
        +entry.affected_communities_identified === 1
      ) {
        count++;
      }

      if (
        index === 1 &&
        +entry.communities_at_risk === 1
      ) {
        count++;
      }

    });

    return count;

  }
  prepareBE09Chart() {

    const years = [
      ...new Set(
        this.allYearsData.map(x => Number(x.year))
      )
    ].sort((a, b) => a - b);

    const progress = years.map(year =>
      this.calculateProgressIndicatorBE09ByYear(year)
    );

    const affectedCommunities = years.map(year =>
      this.calculateContextIndicatorBE09ByYear(0, year)
    );

    const communitiesAtRisk = years.map(year =>
      this.calculateContextIndicatorBE09ByYear(1, year)
    );

    this.chartOptions = {

      series: [

        {
          name: 'Affected Communities Identified',
          type: 'column',
          data: affectedCommunities,
          color: '#42A5F5'
        },

        {
          name: 'Communities at Risk',
          type: 'column',
          data: communitiesAtRisk,
          color: '#66BB6A'
        },

        {
          name: 'Site Fitness',
          type: 'line',
          data: progress,
          color: '#E53935'
        }

      ],

      chart: {
        type: 'line',
        height: 430,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },

      stroke: {
        width: [0, 0, 3],
        curve: 'straight'
      },

      markers: {
        size: [0, 0, 4]
      },

      plotOptions: {
        bar: {
          columnWidth: '40%'
        }
      },

      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },

      yaxis: [
        {
          min: 0,
          max: 100,
          tickAmount: 5,
          title: {
            text: 'Progress Indicator (%)'
          },
          labels: {
            formatter: (value: number) => value + '%'
          }
        },
        {
          opposite: true,
          title: {
            text: 'Communities'
          },
          labels: {
            formatter: (value: number) =>
              Number(value).toLocaleString()
          }
        }
      ],

      tooltip: {
        shared: true,
        y: {
          formatter: (value: number, opts: any) => {

            const seriesName =
              opts.w.config.series[opts.seriesIndex].name;

            if (seriesName === 'Site Fitness') {
              return value + '%';
            }

            return Number(value).toLocaleString();

          }
        }
      },

      legend: {
        position: 'bottom'
      },

      dataLabels: {
        enabled: false
      }

    };

  }

  //  -----product Graph----------------
  // products chart in dashboard by uzair on 14-07-2026

  openProductChart(beCode: string) {
    this.commonService
      .getData(`be-listing/getProductDetailsCompanyAllYears/${beCode}`)
      .subscribe((response: any) => {

        if (response.success) {

          this.allYearsData = response.data.beData;
          this.contextUnit =
            response.data.context_indicator?.unit || '';

          const goal =
            this.products.find((x: any) => x.goal_code === beCode)

          this.chartTitle =
            `${beCode} - ${goal?.goal_short_name || ''} - Annual Progress Trajectory`;

          switch (beCode) {

            case 'BE15':
              this.prepareBE15Chart();
              break;

            case 'BE16':
              this.prepareBE16Chart();
              break;
            case 'BE17':
              this.prepareBE17Chart();
              break;

            case 'BE18':
              this.prepareBE18Chart();
              break;

            case 'BE19':
              this.prepareBE19Chart();
              break;
            default:
              return;
          }

          const dialogRef = this.dialog.open(
            this.chartDialog,
            {
              width: '900px',
              maxWidth: '95vw'
            }
          );

          dialogRef.afterOpened().subscribe(() => {
            window.dispatchEvent(new Event('resize'));
          });

        }

      });

  }

  prepareBE15Chart() {
    const years = [...new Set(this.allYearsData.map(x => Number(x.year)))].sort((a, b) => a - b);
    const scores = years.map(year => this.calculateProgressIndicatorBE15ByYear(year));
    const contextData = years.map(year => this.calculateContextIndicatorBE15ByYear(year));
    this.chartOptions = {
      series: [
        {
          name: 'Progress Indicator',
          type: 'line',
          data: scores,
          color: '#0B6FA4'
        },
        {
          name: 'Context Indicator',
          type: 'column',
          data: contextData,
          color: '#ED7D31'
        }
      ],

      chart: {
        type: 'line',
        height: 350,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },

      stroke: {
        width: [4, 0],
        curve: 'straight'
      },
      colors: ['#0B6FA4'],
      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },
      yaxis: [
        {
          min: 0,
          max: 100,
          tickAmount: 10,
          title: {
            text: 'Progress Indicator (%)'
          },
          labels: {
            formatter: function (val: number) {
              return val + '%';
            }
          }
        },
        {
          opposite: true,
          title: {
            text: 'Context Indicator'
          },
          labels: {
            offsetX: -10,
            formatter: function (val: number) {
              return Number(val).toLocaleString();
            }
          }
        }
      ],
      legend: {
        position: 'bottom'
      },

      dataLabels: {
        enabled: false
      }
    };

  }
  prepareBE16Chart() {
    const years = [...new Set(this.allYearsData.map(x => Number(x.year)))].sort((a, b) => a - b);
    const scores = years.map(year => this.calculateProgressIndicatorBE16ByYear(year));
    const contextData = years.map(year => this.calculateContextIndicatorBE16ByYear(year));
    this.chartOptions = {
      series: [
        {
          name: 'Progress Indicator',
          type: 'line',
          data: scores,
          color: '#0B6FA4'
        },
        {
          name: 'Context Indicator',
          type: 'column',
          data: contextData,
          color: '#ED7D31'
        }
      ],

      chart: {
        type: 'line',
        height: 350,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },

      stroke: {
        width: [4, 0],
        curve: 'straight'
      },
      colors: ['#0B6FA4'],
      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },
      yaxis: [
        {
          min: 0,
          max: 100,
          tickAmount: 10,
          title: {
            text: 'Progress Indicator (%)'
          },
          labels: {
            formatter: function (val: number) {
              return val + '%';
            }
          }
        },
        {
          opposite: true,
          title: {
            text: 'Context Indicator'
          },
          labels: {
            offsetX: -10,
            formatter: function (val: number) {
              return Number(val).toLocaleString();
            }
          }
        }
      ],
      legend: {
        position: 'bottom'
      },

      dataLabels: {
        enabled: false
      }
    };

  }
  prepareBE18Chart() {
    const years = [...new Set(this.allYearsData.map(x => Number(x.year)))].sort((a, b) => a - b);
    const scores = years.map(year => this.calculateProgressIndicatorBE18ByYear(year));
    const contextData = years.map(year => this.calculateContextIndicatorBE18ByYear(year));
    this.chartOptions = {
      series: [
        {
          name: 'Progress Indicator',
          type: 'line',
          data: scores,
          color: '#0B6FA4'
        },
        {
          name: 'Context Indicator',
          type: 'column',
          data: contextData,
          color: '#ED7D31'
        }
      ],

      chart: {
        type: 'line',
        height: 350,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },

      stroke: {
        width: [4, 0],
        curve: 'straight'
      },
      colors: ['#0B6FA4'],
      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },
      yaxis: [
        {
          min: 0,
          max: 100,
          tickAmount: 10,
          title: {
            text: 'Progress Indicator (%)'
          },
          labels: {
            formatter: function (val: number) {
              return val + '%';
            }
          }
        },
        {
          opposite: true,
          title: {
            text: 'Context Indicator'
          },
          labels: {
            offsetX: -10,
            formatter: function (val: number) {
              return Number(val).toLocaleString();
            }
          }
        }
      ],
      legend: {
        position: 'bottom'
      },

      dataLabels: {
        enabled: false
      }
    };

  }

  calculateProgressIndicatorBE15ByYear(year: number): number {

    const yearData = this.allYearsData.filter(
      (x: any) => +x.year == +year
    );

    let totalIncludedRevenue = 0;
    let weightedFitnessSum = 0;

    yearData.forEach((entry: any) => {

      // Only Included products
      if (+entry.relevance_id != 1) return;

      // Revenue
      let revenue =
        entry.revenue ?? 0;

      revenue =
        parseFloat(revenue.toString().replace(/,/g, '')) || 0;

      // Product Fitness %
      let fitness = entry.product_fitness_percentage;

      if (
        fitness == null ||
        fitness == undefined ||
        fitness === '' ||
        revenue == 0
      ) {
        return;
      }

      if (
        typeof fitness === 'string' &&
        fitness.includes('%')
      ) {
        fitness = parseFloat(fitness.replace('%', '')) / 100;
      } else {
        fitness = Number(fitness) / 100;
      }

      if (!isNaN(fitness)) {
        weightedFitnessSum += revenue * fitness;
        totalIncludedRevenue += revenue;
      }

    });

    if (totalIncludedRevenue == 0) {
      return 0;
    }

    const average =
      weightedFitnessSum / totalIncludedRevenue;

    return Math.round(average * 100);

  }
  calculateContextIndicatorBE15ByYear(year: number): number {

    let totalRevenue = 0;

    const yearData = this.allYearsData.filter(
      (x: any) => +x.year == +year
    );

    yearData.forEach((entry: any) => {

      // Only Included products
      if (+entry.relevance_id != 1) return;

      let revenue = entry.revenue ?? '0';

      revenue =
        parseFloat(revenue.toString().replace(/,/g, '')) || 0;

      totalRevenue += revenue;

    });

    return totalRevenue;

  }

  calculateProgressIndicatorBE16ByYear(year: number): number {

    const yearData = this.allYearsData.filter(
      (x: any) => +x.year == +year
    );

    let totalIncludedRevenue = 0;
    let weightedFitnessSum = 0;

    yearData.forEach((entry: any) => {

      if (+entry.relevance_id != 1) return;

      let revenue = entry.revenue ?? 0;
      revenue = parseFloat(revenue.toString().replace(/,/g, '')) || 0;

      let fitness = entry.product_fitness_percentage;

      if (
        fitness == null ||
        fitness == undefined ||
        fitness === '' ||
        revenue == 0
      ) {
        return;
      }

      if (
        typeof fitness === 'string' &&
        fitness.includes('%')
      ) {
        fitness = parseFloat(fitness.replace('%', '')) / 100;
      } else {
        fitness = Number(fitness) / 100;
      }

      if (!isNaN(fitness)) {
        weightedFitnessSum += revenue * fitness;
        totalIncludedRevenue += revenue;
      }

    });

    if (totalIncludedRevenue == 0) {
      return 0;
    }

    const average =
      weightedFitnessSum / totalIncludedRevenue;

    return Math.round(average * 100);

  }
  calculateContextIndicatorBE16ByYear(year: number): number {

    let totalRevenue = 0;

    const yearData = this.allYearsData.filter(
      (x: any) => +x.year == +year
    );

    yearData.forEach((entry: any) => {

      if (+entry.relevance_id != 1) return;

      let revenue = entry.revenue ?? '0';

      revenue =
        parseFloat(revenue.toString().replace(/,/g, '')) || 0;

      totalRevenue += revenue;

    });

    return totalRevenue;

  }

  calculateProgressIndicatorBE18ByYear(year: number): number {

    const yearData = this.allYearsData.filter(
      (x: any) => +x.year === +year
    );

    let numerator = 0;
    let denominator = 0;

    yearData.forEach((entry: any) => {

      if (+entry.relevance_id !== 1) return;

      let revenue =
        parseFloat((entry.revenue ?? '0').toString().replace(/,/g, '')) || 0;

      let productFitness = entry.product_fitness_percentage;

      if (
        productFitness == null ||
        productFitness === '' ||
        revenue === 0
      ) {
        return;
      }

      // Handles both 0.75 and 75%
      if (
        typeof productFitness === 'string' &&
        productFitness.includes('%')
      ) {
        productFitness =
          parseFloat(productFitness.replace('%', '')) / 100;
      } else {
        productFitness = Number(productFitness);

        // If API returns 100 instead of 1
        if (productFitness > 1) {
          productFitness /= 100;
        }
      }

      numerator += revenue * productFitness;
      denominator += revenue;

    });

    if (denominator === 0) {
      return 0;
    }

    return Math.round((numerator / denominator) * 100);

  }
  calculateContextIndicatorBE18ByYear(year: number): number {

    const yearData = this.allYearsData.filter(
      (x: any) => +x.year === +year
    );

    let total = 0;

    yearData.forEach((entry: any) => {

      if (+entry.relevance_id !== 1) return;

      const emitGHGs =
        entry.fitness_ghg == 1 ||
        entry.fitness_ghg === true;

      if (!emitGHGs) return;

      const lifetimeUsePhase =
        parseFloat((entry.fitness_emission ?? '0').toString().replace(/,/g, '')) || 0;

      const unitSold =
        parseFloat((entry.number_unit_sold ?? '0').toString().replace(/,/g, '')) || 0;

      total += lifetimeUsePhase * unitSold;

    });

    return total;

  }

  calculateProgressIndicatorBE17ByYear(index: number, year: number): number {

    let numerator = 0;

    const yearData = this.allYearsData.filter(
      (entry: any) =>
        Number(entry.year) === Number(year) &&
        Number(entry.relevance_id) === 1
    );

    yearData.forEach((entry: any) => {

      const productType = Number(entry.product_type_id);

      const revenue =
        parseFloat(
          (entry.revenue || '0')
            .toString()
            .replace(/,/g, '')
        ) || 0;

      const useFitness =
        (parseFloat(
          (entry.product_fitness_usephase || '0')
            .toString()
            .replace('%', '')
            .trim()
        ) || 0) / 100;

      const endFitness =
        (parseFloat(
          (entry.product_fitness_end || '0')
            .toString()
            .replace('%', '')
            .trim()
        ) || 0) / 100;


      // ---------------------------------
      // Index 0
      // Sold/leased goods + Services
      // Use Phase
      // ---------------------------------
      if (index === 0) {

        if (productType === 1 || productType === 2) {
          numerator += revenue * useFitness;
        }

      }

      // ---------------------------------
      // Index 1
      // Sold/leased goods + Services
      // End Of Life
      // ---------------------------------
      else if (index === 1) {

        if (productType === 1 || productType === 2) {
          numerator += revenue * endFitness;
        }

      }

      // ---------------------------------
      // Index 2
      // Supplementary goods
      // Use Phase
      // ---------------------------------
      else if (index === 2) {

        if (productType === 3) {
          numerator += revenue * useFitness;
        }

      }

      // ---------------------------------
      // Index 3
      // Supplementary goods
      // End Of Life
      // ---------------------------------
      else if (index === 3) {

        if (productType === 3) {
          numerator += revenue * endFitness;
        }

      }

    });


    // Context Indicator / denominator
    const contextIndex =
      index === 0 || index === 1
        ? 0
        : 1;

    const denominator =
      this.calculateContextIndicatorBE17ByYear(
        contextIndex,
        year
      );


    if (!denominator) {
      return 0;
    }


    return Math.round(
      (numerator / denominator) * 100
    );
  }

  calculateContextIndicatorBE17ByYear(
    index: number,
    year: number
  ): number {

    let totalRevenue = 0;

    const yearData = this.allYearsData.filter(
      (entry: any) =>
        Number(entry.year) === Number(year) &&
        Number(entry.relevance_id) === 1
    );


    yearData.forEach((entry: any) => {

      const productType =
        Number(entry.product_type_id);

      const revenue =
        parseFloat(
          (entry.revenue || '0')
            .toString()
            .replace(/,/g, '')
        ) || 0;


      // ---------------------------------
      // Context Index 0
      // Sold/leased goods + Services
      // ---------------------------------
      if (
        index === 0 &&
        (productType === 1 || productType === 2)
      ) {

        totalRevenue += revenue;

      }

      // ---------------------------------
      // Context Index 1
      // Supplementary goods
      // ---------------------------------
      else if (
        index === 1 &&
        productType === 3
      ) {

        totalRevenue += revenue;

      }

    });


    return totalRevenue;
  }

  prepareBE17Chart() {

    const years = [
      ...new Set(
        this.allYearsData.map(x => Number(x.year))
      )
    ].sort((a, b) => a - b);

    // Context Indicators
    const serviceRevenue = years.map(year =>
      this.calculateContextIndicatorBE17ByYear(0, year)
    );

    const supplementaryRevenue = years.map(year =>
      this.calculateContextIndicatorBE17ByYear(1, year)
    );

    // Progress Indicators
    const serviceUsePhase = years.map(year =>
      this.calculateProgressIndicatorBE17ByYear(0, year)
    );

    const serviceEndOfLife = years.map(year =>
      this.calculateProgressIndicatorBE17ByYear(1, year)
    );

    const supplementaryUsePhase = years.map(year =>
      this.calculateProgressIndicatorBE17ByYear(2, year)
    );

    const supplementaryEndOfLife = years.map(year =>
      this.calculateProgressIndicatorBE17ByYear(3, year)
    );

    this.chartOptions = {

      series: [

        {
          name: 'Services / Sold Revenue',
          type: 'column',
          data: serviceRevenue,
          color: '#43A047'
        },

        {
          name: 'Supplementary Revenue',
          type: 'column',
          data: supplementaryRevenue,
          color: '#7CB342'
        },

        {
          name: 'Use Phase (Services/Sold)',
          type: 'line',
          data: serviceUsePhase,
          color: '#1976D2'
        },

        {
          name: 'End of Life (Services/Sold)',
          type: 'line',
          data: serviceEndOfLife,
          color: '#EF6C00'
        },

        {
          name: 'Use Phase (Supplementary)',
          type: 'line',
          data: supplementaryUsePhase,
          color: '#8E24AA'
        },

        {
          name: 'End of Life (Supplementary)',
          type: 'line',
          data: supplementaryEndOfLife,
          color: '#D81B60'
        }

      ],

      chart: {
        type: 'line',
        height: 430,
        toolbar: {
          show: false
        }
      },

      stroke: {
        width: [0, 0, 3, 3, 3, 3]
      },

      markers: {
        size: [0, 0, 4, 4, 4, 4]
      },

      plotOptions: {
        bar: {
          columnWidth: '35%'
        }
      },

      xaxis: {
        categories: years
      },

      yaxis: [
        {
           seriesName: ['End of Life (Services/Sold)', 'Use Phase (Supplementary)', 'End of Life (Supplementary)'],
          min: 0,
          max: 100,
          tickAmount: 5,
          title: {
            text: 'Progress Indicator (%)'
          },
          labels: {
            formatter: (val: number) => val + '%'
          }
        },
        {
          seriesName: ['Services / Sold Revenue', 'Supplementary Revenue'],
          opposite: true,
          title: {
            text: 'Revenue'
          },
          labels: {
            formatter: (val: number) =>
              Number(val).toLocaleString()
          }
        }
      ],

      tooltip: {
        shared: true,
        y: {
          formatter: (value: number, opts: any) => {

            // First two series are Revenue
            if (opts.seriesIndex === 0 || opts.seriesIndex === 1) {
              return Number(value).toLocaleString();
            }

            return value + '%';
          }
        }
      },

      legend: {
        position: 'bottom'
      },

      dataLabels: {
        enabled: false
      }

    };

  }

  calculateProgressIndicatorBE19ByYear(index: number, year: number): number {

    let numerator = 0;

    const yearData = this.allYearsData.filter(item =>
      +item.year === +year &&
      +item.relevance_id === 1
    );

    yearData.forEach((item: any) => {

      const productType = Number(item.product_type_id);

      // Sold or leased goods
      if (index === 0 && productType !== 1) return;

      // Supplementary goods
      if (index === 1 && productType !== 3) return;

      const revenue = Number(item.revenue) || 0;
      const fitness = (Number(item.product_fitness_percentage) || 0) / 100;

      numerator += revenue * fitness;
    });

    const denominator = this.calculateContextIndicatorBE19ByYear(index, year);

    return denominator > 0
      ? Math.round((numerator / denominator) * 100)
      : 0;
  }

  calculateContextIndicatorBE19ByYear(index: number, year: number): number {

    let totalRevenue = 0;

    const yearData = this.allYearsData.filter(item =>
      +item.year === +year &&
      +item.relevance_id === 1
    );

    yearData.forEach((item: any) => {

      const productType = Number(item.product_type_id);

      // Sold or leased goods
      if (index === 0 && productType !== 1) return;

      // Supplementary goods
      if (index === 1 && productType !== 3) return;

      totalRevenue += Number(item.revenue) || 0;
    });

    return totalRevenue;
  }
  prepareBE19Chart() {

    const years = [
      ...new Set(this.allYearsData.map(x => Number(x.year)))
    ].sort((a, b) => a - b);

    const soldGoodsProgress = years.map(year =>
      this.calculateProgressIndicatorBE19ByYear(0, year)
    );

    const supplementaryProgress = years.map(year =>
      this.calculateProgressIndicatorBE19ByYear(1, year)
    );

    const soldGoodsRevenue = years.map(year =>
      this.calculateContextIndicatorBE19ByYear(0, year)
    );

    const supplementaryRevenue = years.map(year =>
      this.calculateContextIndicatorBE19ByYear(1, year)
    );

    // this.contextUnit =
    //   this.goal?.ContextIndicators?.[0]?.unit || '';

    this.chartOptions = {

      series: [

        {
          name: 'Sold or leased goods',
          type: 'column',
          data: soldGoodsRevenue,
          color: '#2E7D32'
        },

        {
          name: 'Supplementary goods',
          type: 'column',
          data: supplementaryRevenue,
          color: '#29B6F6'
        },

        {
          name: 'Sold or leased goods Fitness',
          type: 'line',
          data: soldGoodsProgress,
          color: '#1565C0'
        },

        {
          name: 'Supplementary goods Fitness',
          type: 'line',
          data: supplementaryProgress,
          color: '#EF6C00'
        }

      ],

      chart: {
        type: 'line',
        height: 430,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },

      stroke: {
        width: [0, 0, 3, 3],
        curve: 'straight'
      },

      plotOptions: {
        bar: {
          columnWidth: '35%'
        }
      },

      markers: {
        size: [0, 0, 4, 4]
      },

      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },

      yaxis: [

        {
          seriesName: [
            'Sold or leased goods Fitness',
            'Supplementary goods Fitness'
          ],
          min: 0,
          max: 100,
          tickAmount: 5,
          title: {
            text: 'Progress Indicator (%)'
          },
          labels: {
            formatter: (value: number) => value + '%'
          }
        },

        {
          seriesName: [
            'Sold or leased goods',
            'Supplementary goods'
          ],
          opposite: true,
          title: {
            text: this.contextUnit || 'Revenue'
          },
          labels: {
            formatter: (value: number) =>
              Number(value).toLocaleString()
          }
        }

      ],

      tooltip: {

        shared: true,

        y: {

          formatter: (value: number, opts: any) => {

            const seriesName =
              opts.w.config.series[opts.seriesIndex].name;

            switch (seriesName) {

              case 'Sold or leased goods Fitness':
              case 'Supplementary goods Fitness':
                return value + '%';

              default:
                return (
                  Number(value).toLocaleString() +
                  ' ' +
                  this.contextUnit
                );

            }

          }

        }

      },

      legend: {
        position: 'bottom'
      },

      dataLabels: {
        enabled: false
      }

    };

  }


  // --------
  openEmployeeChart(beCode: string) {
    this.commonService
      .getData(`be-listing/getEmployeeDetailsCompanyAllYears/${beCode}`)
      .subscribe((response: any) => {

        if (response.success) {

          this.allYearsData = response.data.beData;
          this.contextUnit =
            response.data.context_indicator?.unit || '';

          let goal
          // =
          //   this.employees.find((x: any) => x.goal_code === beCode)
          if (['BE20'].includes(beCode)) {
            goal = this.goverance.find((x: any) => x.goal_code === beCode);
          } else {
            goal = this.employees.find((x: any) => x.goal_code === beCode);
          }
          this.chartTitle =
            `${beCode} - ${goal?.goal_short_name || ''} - Annual Progress Trajectory`;

          switch (beCode) {

            case 'BE10':
              this.prepareBE10Chart();
              break;
            case 'BE11':
              this.prepareBE11Chart();
              break;

            case 'BE12':
              this.prepareBE12Chart();
              break;

            case 'BE13':
              this.prepareBE13Chart();
              break;

            case 'BE14':
              this.prepareBE14Chart();
              break;

            case 'BE20':
              this.prepareBE20Chart();
              break;

            default:
              return;
          }

          const dialogRef = this.dialog.open(
            this.chartDialog,
            {
              width: '900px',
              maxWidth: '95vw'
            }
          );

          dialogRef.afterOpened().subscribe(() => {
            window.dispatchEvent(new Event('resize'));
          });

        }

      });

  }
  calculateProgressIndicatorBE10ByYear(year: number): number {

    let numerator = 0;
    let denominator = 0;

    const yearData = this.allYearsData.filter(
      x => +x.year === +year
    );

    yearData.forEach((entry: any) => {

      if (+entry.relevance_id !== 1) {
        return;
      }

      const employeeCount =
        +entry.number_of_employees || 0;

      const siteFitness =
        parseFloat(entry.site_fitness_percentage || 0);

      numerator += employeeCount * siteFitness;
      denominator += employeeCount;

    });

    if (denominator === 0) {
      return 0;
    }

    return Math.round(numerator / denominator);

  }
  calculateContextIndicatorBE10ByYear(year: number): number {

    let totalEmployees = 0;

    const yearData = this.allYearsData.filter(
      x => +x.year === +year
    );

    yearData.forEach((entry: any) => {

      if (+entry.relevance_id !== 1) {
        return;
      }

      totalEmployees +=
        +entry.number_of_employees || 0;

    });

    return totalEmployees;

  }
  prepareBE10Chart() {

    const years = [
      ...new Set(
        this.allYearsData.map(x => Number(x.year))
      )
    ].sort((a, b) => a - b);

    const progressData = years.map(year =>
      this.calculateProgressIndicatorBE10ByYear(year)
    );

    const employeeCount = years.map(year =>
      this.calculateContextIndicatorBE10ByYear(year)
    );

    this.chartOptions = {

      series: [
        {
          name: 'Total Number of Employees',
          type: 'column',
          data: employeeCount,
          color: '#43A047'
        },
        {
          name: 'Employee Health & Safety Fitness',
          type: 'line',
          data: progressData,
          color: '#1976D2'
        }
      ],

      chart: {
        type: 'line',
        height: 430,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },

      stroke: {
        width: [0, 3],
        curve: 'straight'
      },

      plotOptions: {
        bar: {
          columnWidth: '35%'
        }
      },

      markers: {
        size: [0, 4]
      },

      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },

      yaxis: [
        {
          min: 0,
          max: 100,
          title: {
            text: 'Progress Indicator (%)'
          },
          labels: {
            formatter: (v: number) => v + '%'
          }
        },
        {
          opposite: true,
          title: {
            text: 'Employees'
          },
          labels: {
            formatter: (v: number) =>
              Number(v).toLocaleString('en-US')
          }
        }
      ],

      tooltip: {
        shared: true,
        y: {
          formatter: (value: number, opts: any) => {

            const seriesName =
              opts.w.config.series[opts.seriesIndex].name;

            if (seriesName === 'Employee Health & Safety Fitness') {
              return value + '%';
            }

            return Number(value).toLocaleString('en-US');

          }
        }
      },

      legend: {
        position: 'bottom'
      },

      dataLabels: {
        enabled: false
      }

    };

  }

  prepareBE11Chart() {
    const years = [...new Set(this.allYearsData.map(x => Number(x.year)))].sort((a, b) => a - b);
    const scores = years.map(year => this.calculateProgressIndicatorBE11ByYear(year));
    const contextData = years.map(year => this.calculateContextIndicatorBE11ByYear(year));
    this.chartOptions = {
      series: [
        {
          name: 'Progress Indicator',
          type: 'line',
          data: scores,
          color: '#0B6FA4'
        },
        {
          name: 'Context Indicator',
          type: 'column',
          data: contextData,
          color: '#ED7D31'
        }
      ],

      chart: {
        type: 'line',
        height: 350,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },

      stroke: {
        width: [4, 0],
        curve: 'straight'
      },
      colors: ['#0B6FA4'],
      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },
      yaxis: [
        {
          min: 0,
          max: 100,
          tickAmount: 10,
          title: {
            text: 'Progress Indicator (%)'
          },
          labels: {
            formatter: function (val: number) {
              return val + '%';
            }
          }
        },
        {
          opposite: true,
          title: {
            text: 'Context Indicator'
          },
          labels: {
            offsetX: -10,
            formatter: function (val: number) {
              return Number(val).toLocaleString();
            }
          }
        }
      ],
      legend: {
        position: 'bottom'
      },

      dataLabels: {
        enabled: false
      }
    };

  }

  calculateProgressIndicatorBE11ByYear(year: number): number {

    const yearData = this.allYearsData.filter(
      (x: any) => +x.year == +year
    );

    let numerator = 0;
    let denominator = 0;

    yearData.forEach((entry: any) => {

      if (+entry.relevance_id != 1) return;

      let employeeCount =
        entry.fitnessnumber_of_employees ||
        entry.number_of_employees ||
        0;

      employeeCount =
        parseInt(employeeCount.toString().replace(/,/g, ''), 10) || 0;

      let fitness = entry.employee_fitness_percentage ?? '0';

      if (typeof fitness == 'string') {
        fitness = parseFloat(fitness.replace('%', '')) || 0;
      }

      numerator += employeeCount * fitness;
      denominator += employeeCount;

    });

    if (denominator == 0) {
      return 0;
    }

    return Math.round(numerator / denominator);

  }
  calculateContextIndicatorBE11ByYear(year: number): number {

    let total = 0;

    const yearData = this.allYearsData.filter(
      (x: any) => +x.year == +year
    );

    yearData.forEach((entry: any) => {

      if (+entry.relevance_id != 1) return;

      const employeeCount =
        parseInt(
          (
            entry.fitnessnumber_of_employees ||
            entry.number_of_employees ||
            '0'
          ).toString().replace(/,/g, ''),
          10
        ) || 0;

      total += employeeCount;

    });

    return total;

  }
  prepareBE12Chart() {
    const years = [...new Set(this.allYearsData.map(x => Number(x.year)))].sort((a, b) => a - b);
    const scores = years.map(year => this.calculateProgressIndicatorBE12ByYear(year));
    const contextData = years.map(year => this.calculateContextIndicatorBE12ByYear(year));
    this.chartOptions = {
      series: [
        {
          name: 'Progress Indicator',
          type: 'line',
          data: scores,
          color: '#0B6FA4'
        },
        {
          name: 'Context Indicator',
          type: 'column',
          data: contextData,
          color: '#ED7D31'
        }
      ],

      chart: {
        type: 'line',
        height: 350,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },

      stroke: {
        width: [4, 0],
        curve: 'straight'
      },
      colors: ['#0B6FA4'],
      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },
      yaxis: [
        {
          min: 0,
          max: 100,
          tickAmount: 10,
          title: {
            text: 'Progress Indicator (%)'
          },
          labels: {
            formatter: function (val: number) {
              return val + '%';
            }
          }
        },
        {
          opposite: true,
          title: {
            text: 'Context Indicator'
          },
          labels: {
            offsetX: -10,
            formatter: function (val: number) {
              return Number(val).toLocaleString();
            }
          }
        }
      ],
      legend: {
        position: 'bottom'
      },

      dataLabels: {
        enabled: false
      }
    };

  }
  calculateProgressIndicatorBE12ByYear(year: number): number {

    const yearData = this.allYearsData.filter(
      (x: any) => +x.year == +year
    );

    let numerator = 0;
    let denominator = 0;

    yearData.forEach((entry: any) => {

      if (+entry.relevance_id != 1) return;

      let employeeCount =
        entry.fitnessnumber_of_employees ??
        entry.number_of_employees ??
        0;

      employeeCount =
        parseInt(employeeCount.toString().replace(/,/g, ''), 10) || 0;

      let fitness = entry.employee_fitness_percentage ?? '0';

      if (typeof fitness == 'string') {
        fitness = parseFloat(fitness.replace('%', '')) || 0;
      }

      numerator += employeeCount * fitness;
      denominator += employeeCount;

    });

    if (denominator == 0) {
      return 0;
    }

    return Math.round(numerator / denominator);

  }
  calculateContextIndicatorBE12ByYear(year: number): number {

    let total = 0;

    const yearData = this.allYearsData.filter(
      (x: any) => +x.year == +year
    );

    yearData.forEach((entry: any) => {

      if (+entry.relevance_id != 1) return;

      const employeeCount =
        parseInt(
          (
            entry.fitnessnumber_of_employees ??
            entry.number_of_employees ??
            '0'
          ).toString().replace(/,/g, ''),
          10
        ) || 0;

      total += employeeCount;

    });

    return total;

  }
  prepareBE13Chart() {
    const years = [...new Set(this.allYearsData.map(x => Number(x.year)))].sort((a, b) => a - b);
    const scores = years.map(year => this.calculateProgressIndicatorBE13ByYear(year));
    const contextData = years.map(year => this.calculateContextIndicatorBE13ByYear(year));
    this.chartOptions = {
      series: [
        {
          name: 'Progress Indicator',
          type: 'line',
          data: scores,
          color: '#0B6FA4'
        },
        {
          name: 'Context Indicator',
          type: 'column',
          data: contextData,
          color: '#ED7D31'
        }
      ],

      chart: {
        type: 'line',
        height: 350,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },

      stroke: {
        width: [4, 0],
        curve: 'straight'
      },
      colors: ['#0B6FA4'],
      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },
      yaxis: [
        {
          min: 0,
          max: 100,
          tickAmount: 10,
          title: {
            text: 'Progress Indicator (%)'
          },
          labels: {
            formatter: function (val: number) {
              return val + '%';
            }
          }
        },
        {
          opposite: true,
          title: {
            text: 'Context Indicator'
          },
          labels: {
            offsetX: -10,
            formatter: function (val: number) {
              return Number(val).toLocaleString();
            }
          }
        }
      ],
      legend: {
        position: 'bottom'
      },

      dataLabels: {
        enabled: false
      }
    };

  }
  calculateProgressIndicatorBE13ByYear(year: number): number {

    const yearData = this.allYearsData.filter(
      (x: any) => +x.year === +year
    );

    let totalEmployees = 0;
    let weightedSum = 0;

    yearData.forEach((entry: any) => {

      if (+entry.relevance_id != 1) return;

      let employeeCount =
        entry.fitnessnumber_of_employees ??
        entry.number_of_employees ??
        0;

      employeeCount =
        parseInt(employeeCount.toString().replace(/,/g, ''), 10) || 0;

      let fitnessValue = entry.employee_fitness_percentage;

      if (fitnessValue != null && fitnessValue != undefined) {

        if (
          typeof fitnessValue == 'string' &&
          fitnessValue.includes('%')
        ) {
          fitnessValue =
            parseFloat(fitnessValue.replace('%', '')) / 100;
        } else {
          fitnessValue = +fitnessValue / 100;
        }

        if (employeeCount > 0) {
          weightedSum += employeeCount * fitnessValue;
          totalEmployees += employeeCount;
        }
      }

    });

    if (totalEmployees == 0) {
      return 0;
    }

    return Math.round((weightedSum / totalEmployees) * 100);

  }
  calculateContextIndicatorBE13ByYear(year: number): number {

    let total = 0;

    const yearData = this.allYearsData.filter(
      (x: any) => +x.year == +year
    );

    yearData.forEach((entry: any) => {

      if (+entry.relevance_id != 1) return;

      const employeeCount =
        parseInt(
          (
            entry.fitnessnumber_of_employees ??
            entry.number_of_employees ??
            '0'
          ).toString().replace(/,/g, ''),
          10
        ) || 0;

      total += employeeCount;

    });

    return total;

  }
  prepareBE14Chart() {
    const years = [...new Set(this.allYearsData.map(x => Number(x.year)))].sort((a, b) => a - b);
    const scores = years.map(year => this.calculateProgressIndicatorBE14ByYear(year));
    const contextData = years.map(year => this.calculateContextIndicatorBE14ByYear(year));
    this.chartOptions = {
      series: [
        {
          name: 'Progress Indicator',
          type: 'line',
          data: scores,
          color: '#0B6FA4'
        },
        {
          name: 'Context Indicator',
          type: 'column',
          data: contextData,
          color: '#ED7D31'
        }
      ],

      chart: {
        type: 'line',
        height: 350,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },

      stroke: {
        width: [4, 0],
        curve: 'straight'
      },
      colors: ['#0B6FA4'],
      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },
      yaxis: [
        {
          min: 0,
          max: 100,
          tickAmount: 10,
          title: {
            text: 'Progress Indicator (%)'
          },
          labels: {
            formatter: function (val: number) {
              return val + '%';
            }
          }
        },
        {
          opposite: true,
          title: {
            text: 'Context Indicator'
          },
          labels: {
            offsetX: -10,
            formatter: function (val: number) {
              return Number(val).toLocaleString();
            }
          }
        }
      ],
      legend: {
        position: 'bottom'
      },

      dataLabels: {
        enabled: false
      }
    };

  }
  calculateProgressIndicatorBE14ByYear(year: number): number {

    const yearData = this.allYearsData.filter(
      (x: any) => +x.year == +year
    );

    let totalIncludedEmployees = 0;
    let weightedFitnessSum = 0;

    yearData.forEach((entry: any) => {

      if (+entry.relevance_id != 1) return;

      let employeeCount =
        entry.fitnessnumber_of_employees ??
        entry.number_of_employees ??
        0;

      employeeCount =
        parseInt(employeeCount.toString().replace(/,/g, ''), 10) || 0;

      let fitness = entry.employee_fitness_percentage;

      if (
        fitness == null ||
        fitness == undefined ||
        employeeCount == 0
      ) {
        return;
      }

      if (
        typeof fitness == 'string' &&
        fitness.includes('%')
      ) {
        fitness = parseFloat(fitness.replace('%', '')) / 100;
      } else {
        fitness = Number(fitness) / 100;
      }

      if (!isNaN(fitness)) {
        weightedFitnessSum += employeeCount * fitness;
        totalIncludedEmployees += employeeCount;
      }

    });

    if (totalIncludedEmployees == 0) {
      return 0;
    }

    const average =
      weightedFitnessSum / totalIncludedEmployees;

    return Math.round(average * 100);

  }
  calculateContextIndicatorBE14ByYear(year: number): number {

    let totalEmployees = 0;

    const yearData = this.allYearsData.filter(
      (x: any) => +x.year == +year
    );

    yearData.forEach((entry: any) => {

      if (+entry.relevance_id != 1) return;

      const employeeCount =
        parseInt(
          (
            entry.fitnessnumber_of_employees ??
            entry.number_of_employees ??
            '0'
          ).toString().replace(/,/g, ''),
          10
        ) || 0;

      totalEmployees += employeeCount;

    });

    return totalEmployees;

  }
  prepareBE20Chart() {
    const years = [...new Set(this.allYearsData.map(x => Number(x.year)))].sort((a, b) => a - b);
    const scores = years.map(year => this.calculateProgressIndicatorBE20ByYear(year));
    const contextData = years.map(year => this.calculateContextIndicatorBE20ByYear(year));
    this.chartOptions = {
      series: [
        {
          name: 'Progress Indicator',
          type: 'line',
          data: scores,
          color: '#0B6FA4'
        },
        {
          name: 'Context Indicator',
          type: 'column',
          data: contextData,
          color: '#ED7D31'
        }
      ],

      chart: {
        type: 'line',
        height: 350,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },

      stroke: {
        width: [4, 0],
        curve: 'straight'
      },
      colors: ['#0B6FA4'],
      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },
      yaxis: [
        {
          min: 0,
          max: 100,
          tickAmount: 10,
          title: {
            text: 'Progress Indicator (%)'
          },
          labels: {
            formatter: function (val: number) {
              return val + '%';
            }
          }
        },
        {
          opposite: true,
          title: {
            text: 'Context Indicator'
          },
          labels: {
            offsetX: -10,
            formatter: function (val: number) {
              return Number(val).toLocaleString();
            }
          }
        }
      ],
      legend: {
        position: 'bottom'
      },

      dataLabels: {
        enabled: false
      }
    };

  }
  calculateProgressIndicatorBE20ByYear(year: number): number {

    const yearData = this.allYearsData.filter(
      (x: any) => +x.year == +year
    );

    let numerator = 0;
    let denominator = 0;

    yearData.forEach((entry: any) => {

      if (+entry.relevance_id !== 1) return;

      const employeeCount =
        parseInt(
          (
            entry.fitnessnumber_of_employees ??
            entry.number_of_employees ??
            '0'
          ).toString().replace(/,/g, ''),
          10
        ) || 0;

      if (employeeCount <= 0) return;

      let fitness = entry.employee_fitness_percentage ?? '0';

      if (
        typeof fitness == 'string' &&
        fitness.includes('%')
      ) {
        fitness = parseFloat(fitness.replace('%', '')) || 0;
      } else {
        fitness = Number(fitness) || 0;
      }

      numerator += employeeCount * fitness;
      denominator += employeeCount;

    });

    if (denominator == 0) {
      return 0;
    }

    return Math.round(numerator / denominator);

  }
  calculateContextIndicatorBE20ByYear(year: number): number {

    let totalEmployees = 0;

    const yearData = this.allYearsData.filter(
      (x: any) => +x.year == +year
    );

    yearData.forEach((entry: any) => {

      if (+entry.relevance_id != 1) return;

      const employeeCount =
        parseInt(
          (
            entry.fitnessnumber_of_employees ??
            entry.number_of_employees ??
            '0'
          ).toString().replace(/,/g, ''),
          10
        ) || 0;

      totalEmployees += employeeCount;

    });

    return totalEmployees;

  }
  // ------------

  calculateProgressIndicatorBE01(): string {
    let totalRenewable = 0;
    let totalEnergy = 0;
    if (!this.SitesDetails || !this.SitesDetails.be01_data || this.SitesDetails.be01_data.length === 0) {
      return '0%';
    }
    this.SitesDetails.be01_data.forEach((entry: any) => {
      totalRenewable += +entry.amount_of_renewable_energy_used;
      totalEnergy += +entry.total_amount_of_energy_used;
    });
    if (totalEnergy === 0) return '0%';
    if (totalRenewable > totalEnergy) return 'Error';

    const percentage = Math.round((totalRenewable / totalEnergy) * 100);

    return `${percentage}%`;
  }

  updateBE01Score(): void {
    const fitness = this.calculateProgressIndicatorBE01();
    const fitnessValue = fitness === 'Error'
      ? 0
      : (parseInt(fitness.replace('%', '')) || 0);
    const be01Site = this.Sites.find((site: any) => site.goal_code === 'BE01');
    if (!be01Site) return;
    if (!Array.isArray(be01Site.progress_indicators) || be01Site.progress_indicators.length === 0) {
      be01Site.progress_indicators = [{ score: fitnessValue }];
      return;
    }
    be01Site.progress_indicators[0].score = fitnessValue;
  }

  calculateProgressIndicatorBE02(index: number): string {
    let totalFit = 0;
    let total = 0;
    let errorFound = false;

    const be02Data = this.SitesDetails?.be02_data || [];

    be02Data.forEach((entry: any) => {
      if (index === 0 && entry.relevance_id === 1) {
        totalFit += +entry.commercial_water_consumption_fit_source || 0;
        total += +entry.total_commercial_water_consumption || 0;
      }

      if (index === 1 && entry.Relevance_id_2 === 1) {
        const dischargeRelevance = +entry.fit_discharged_water || 0;
        const fitDischarged = +entry.total_discharged_water || 0;

        if (dischargeRelevance > fitDischarged) {
          errorFound = true;
        }

        totalFit += dischargeRelevance;
        total += fitDischarged;
      }
    });

    if (index === 1 && errorFound) return 'Error';
    if (total === 0) return '0%';

    const percentage = Math.round((totalFit / total) * 100);
    return `${percentage}%`;
  }

  updateBE02Score(): void {
    const be02 = this.Sites.find((s: any) => s.goal_code === 'BE02');
    if (!be02) return;
    const score1 = this.calculateProgressIndicatorBE02(0);
    const score2 = this.calculateProgressIndicatorBE02(1);
    const value1 = score1 === 'Error' ? 0 : (parseInt(score1.replace('%', '')) || 0);
    const value2 = score2 === 'Error' ? 0 : (parseInt(score2.replace('%', '')) || 0);
    if (!Array.isArray(be02.progress_indicators)) {
      be02.progress_indicators = [];
    }
    if (!be02.progress_indicators[0]) {
      be02.progress_indicators[0] = { score: 0 };
    }
    if (!be02.progress_indicators[1]) {
      be02.progress_indicators[1] = { score: 0 };
    }
    be02.progress_indicators[0].score = value1;
    be02.progress_indicators[1].score = value2;
  }


  calculateProgressIndicatorBE05(index: number): string {
    const be05Data = this.SitesDetails?.be05_data || [];

    let totalReference = 0;
    let totalReporting = 0;
    let errorFound = false;
    let includedWithEmissions = 0;
    let includedNoEmissions = 0;

    be05Data.forEach((entry: any) => {
      if (index == 0) {
        // Gaseous
        if (entry.relevance_id_gaseous == 2) includedNoEmissions++;
        if (entry.relevance_id_gaseous == 1) {
          includedWithEmissions++;
          totalReference += +entry.gaseous_reference_year || 0;
          totalReporting += +entry.gaseous_reporting_year || 0;
        }
      }

      if (index == 1) {
        // Liquid
        if (entry.relevance_id_liquid == 2) includedNoEmissions++;
        if (entry.relevance_id_liquid == 1) {
          includedWithEmissions++;
          totalReference += +entry.liquid_reference_year || 0;
          totalReporting += +entry.liquid_reporting_year || 0;
        }
      }

      if (index == 2) {
        // Solid
        if (entry.relevance_id_solid == 2) includedNoEmissions++;
        if (entry.relevance_id_solid == 1) {
          includedWithEmissions++;
          totalReference += +entry.solid_reference_year || 0;
          totalReporting += +entry.solid_reporting_year || 0;
        }
      }
    });

    if (includedNoEmissions > 0 && includedWithEmissions === 0) {
      return '100%';
    }

    if (totalReporting > totalReference) return '0%';
    if (totalReference == 0) return '';

    const percentage = Math.round(((totalReference - totalReporting) / totalReference) * 100);
    return `${percentage}%`;
  }
  updateBE05Score(): void {
    const be05 = this.Sites.find((s: any) => s.goal_code === 'BE05');
    if (!be05) return;

    if (!Array.isArray(be05.progress_indicators)) {
      be05.progress_indicators = [];
    }

    const s0 = this.calculateProgressIndicatorBE05(0);
    be05.progress_indicators[0] = {
      ...be05.progress_indicators[0],
      score: s0 === 'Error' ? 0 : parseInt(s0.replace('%', '')) || 0
    };

    const s1 = this.calculateProgressIndicatorBE05(1);
    be05.progress_indicators[1] = {
      ...be05.progress_indicators[1],
      score: s1 === 'Error' ? 0 : parseInt(s1.replace('%', '')) || 0
    };


    const s2 = this.calculateProgressIndicatorBE05(2);
    be05.progress_indicators[2] = {
      ...be05.progress_indicators[2],
      score: s2 === 'Error' ? 0 : parseInt(s2.replace('%', '')) || 0
    };
  }

  calculateProgressIndicatorBE06(): string {
    let sumGhgReferenceYear = 0;
    let sumGhgReportingYear = 0;
    let sumGhgOffset = 0;

    let relevantInputsCount = 0;
    let allNoGHG = true;

    const be06Data = this.SitesDetails?.be06_data || [];

    be06Data.forEach((entry: any) => {
      if (entry.relevance_id === 1) {
        relevantInputsCount++;

        if (entry.no_ghg_emission_id !== 1) {
          allNoGHG = false;
          sumGhgReferenceYear += +entry.ghg_reference_year || 0;
          sumGhgReportingYear += +entry.ghg_reporting_year || 0;
          sumGhgOffset += +entry.ghg_adequately_offset || 0;
        }
      }
    });

    if (relevantInputsCount === 0) return '';
    if (allNoGHG) return '100%';
    if (sumGhgReferenceYear === 0) return '';
    if (sumGhgReportingYear > sumGhgReferenceYear) return '0%';

    const progress = ((sumGhgReferenceYear - sumGhgReportingYear + sumGhgOffset) / sumGhgReferenceYear) * 100;
    return Math.round(progress) + '%';
  }

  updateBE06Score(): void {
    const be06 = this.Sites.find((s: any) => s.goal_code === 'BE06');
    if (!be06) return;

    const score = this.calculateProgressIndicatorBE06();
    const parsedScore = score === 'Error'
      ? 0
      : (parseInt(score.replace('%', '')) || 0);


    if (!Array.isArray(be06.progress_indicators)) {
      be06.progress_indicators = [];
    }

    if (!be06.progress_indicators[0]) {
      be06.progress_indicators[0] = { score: 0 };
    }


    be06.progress_indicators[0].score = parsedScore;
  }

  calculateProgressIndicatorBE07(): string {
    const be07Data = this.SitesDetails?.be07_data || [];

    let refTotal = 0;
    let reportTotal = 0;
    let countRelevant = 0;
    let countNoWaste = 0;

    be07Data.forEach((entry: any) => {
      const relevance = entry.relevance_id;
      const siteAssessedWasteId = entry.site_assessed_waste_id;
      const reference = +entry.waste_reference_year || 0;
      const reporting = +entry.waste_reporting_year || 0;

      if (relevance === 1) {
        countRelevant++;

        if (siteAssessedWasteId === 1) {
          countNoWaste++;
        }

        refTotal += reference;
        reportTotal += reporting;
      }
    });

    if (countRelevant > 0 && countRelevant === countNoWaste) {
      return '100%';
    }

    if (reportTotal > refTotal) return '0%';
    if (refTotal === 0) return '';

    const fitness = ((refTotal - reportTotal) / refTotal) * 100;
    return Math.round(fitness) + '%';

  }


  updateBE07Score(): void {
    const be07 = this.Sites.find((s: any) => s.goal_code === 'BE07');
    if (!be07) return;

    const score = this.calculateProgressIndicatorBE07();
    const parsedScore = score === 'Error'
      ? 0
      : (parseInt(score.replace('%', '')) || 0);


    if (!Array.isArray(be07.progress_indicators)) {
      be07.progress_indicators = [];
    }


    if (!be07.progress_indicators[0]) {
      be07.progress_indicators[0] = { score: 0 };
    }


    be07.progress_indicators[0].score = parsedScore;
  }

  calculateProgressIndicatorBE08(): string {
    let numerator = 0;
    let denominator = 0;

    const be08Data = this.SitesDetails?.be08_data || [];

    be08Data.forEach((entry: any) => {
      if (entry.relevance_id === 1) {
        const siteArea = +entry.site_area || 0;
        const rawFitness = entry.site_fitness_percent ?? '0';
        const fitnessStr = typeof rawFitness === 'string' ? rawFitness : rawFitness + '%';
        const fitnessPercent = parseFloat(fitnessStr.replace('%', '')) || 0;

        numerator += siteArea * fitnessPercent;
        denominator += siteArea;
      }
    });

    if (denominator === 0) return '';
    const weightedAvg = numerator / denominator;
    return Math.round(weightedAvg) + '%';
  }
  //New 
  updateBE08Score(): void {
    const be08 = this.Sites.find((s: any) => s.goal_code === 'BE08');
    if (!be08) return;

    const score = this.calculateProgressIndicatorBE08();
    const parsedScore = score === 'Error'
      ? 0
      : (parseInt(score.replace('%', '')) || 0);


    if (!Array.isArray(be08.progress_indicators)) {
      be08.progress_indicators = [];
    }

    if (!be08.progress_indicators[0]) {
      be08.progress_indicators[0] = { score: 0 };
    }


    be08.progress_indicators[0].score = parsedScore;
  }

  calculateProgressIndicatorBE09(): string {

    if (!this.SitesDetails || !this.SitesDetails.be09_data || this.SitesDetails.be09_data.length === 0) {
      return '';
    }

    let numerator = 0;
    let denominator = 0;

    this.SitesDetails.be09_data.forEach((site: any) => {
      const relevance = site.relevance_id;
      const affected = site.affected_communities_identified;

      if (relevance == 1 && affected === 1) {
        const fitness = parseFloat(site.site_fitness_percentage) || 0;
        numerator += fitness;
        denominator++;
      }
    });

    if (denominator === 0) return '';
    const result = numerator / denominator;
    return Math.round(result) + '%';
  }

  updateBE09Score(): void {
    const fitness = this.calculateProgressIndicatorBE09();
    const fitnessValue = fitness === 'Error'
      ? 0
      : (parseInt(fitness.replace('%', '')) || 0);

    const be09Site = this.Sites.find((site: any) => site.goal_code === 'BE09');
    if (!be09Site) return;


    if (!Array.isArray(be09Site.progress_indicators)) {
      be09Site.progress_indicators = [];
    }


    if (!be09Site.progress_indicators[0]) {
      be09Site.progress_indicators[0] = { score: 0 };
    }


    be09Site.progress_indicators[0].score = fitnessValue;
  }




  calculateProgressIndicatorBE10(): string {
    const be10Data = this.EmployeeDetails?.be10_data || [];
    if (!be10Data.length) return "";

    let numerator = 0;
    let denominator = 0;

    be10Data.forEach((entry: any) => {
      if (entry.relevance_id !== 1) return;


      let employeeCount = entry.fitnessnumber_of_employees ?? entry.number_of_employees ?? 0;
      employeeCount = parseInt(employeeCount.toString().replace(/,/g, ""), 10) || 0;


      let fitness = entry.site_fitness_percentage ?? "0";
      if (typeof fitness === "string") {
        fitness = parseFloat(fitness.replace("%", "")) || 0;
      }

      numerator += employeeCount * fitness;
      denominator += employeeCount;
    });

    if (denominator === 0) return "";

    return Math.round(numerator / denominator) + "%";
  }



  updateBE10Score(): void {
    const be10 = this.employees?.find((e: any) => e.goal_code === 'BE10');
    if (!be10) return;

    const score = this.calculateProgressIndicatorBE10();
    const parsedScore = score === 'Error'
      ? 0
      : (parseInt(score.replace('%', '')) || 0);


    if (!Array.isArray(be10.progress_indicators)) {
      be10.progress_indicators = [];
    }


    if (!be10.progress_indicators[0]) {
      be10.progress_indicators[0] = { score: 0 };
    }


    be10.progress_indicators[0].score = parsedScore;
  }





  calculateProgressIndicatorBE11(): string {
    const be11Data = this.EmployeeDetails?.be11_data || [];
    if (be11Data.length === 0) return "0%";

    let numerator = 0;
    let denominator = 0;

    be11Data.forEach((entry: any) => {
      if (entry.relevance_id != 1) return;

      let employeeCount = entry.fitnessnumber_of_employees || entry.number_of_employees || 0;
      employeeCount = parseInt(employeeCount.toString().replace(/,/g, ""), 10) || 0;

      // fitness percentage (same as component)
      let fitness = entry.employee_fitness_percentage ?? "0";
      if (typeof fitness === "string") {
        fitness = parseFloat(fitness.replace("%", "")) || 0;
      }

      numerator += employeeCount * fitness;
      denominator += employeeCount;
    });

    if (denominator == 0) return "0%";

    const result = numerator / denominator;
    return Math.round(result) + "%";
  }



  updateBE11Score(): void {
    const be11 = this.employees?.find((e: any) => e.goal_code === 'BE11');
    if (!be11) return;

    const score = this.calculateProgressIndicatorBE11();
    const parsedScore = score === 'Error'
      ? 0
      : (parseInt(score.replace('%', '')) || 0);


    if (!Array.isArray(be11.progress_indicators)) {
      be11.progress_indicators = [];
    }


    if (!be11.progress_indicators[0]) {
      be11.progress_indicators[0] = { score: 0 };
    }


    be11.progress_indicators[0].score = parsedScore;
  }



  calculateProgressIndicatorBE12(): string {
    const be12Data = this.EmployeeDetails?.be12_data || [];
    if (be12Data.length == 0) return "0%";

    let numerator = 0;
    let denominator = 0;

    be12Data.forEach((entry: any) => {
      if (entry.relevance_id !== 1) return;


      let employeeCount = entry.fitnessnumber_of_employees ?? entry.number_of_employees ?? 0;
      employeeCount = parseInt(employeeCount.toString().replace(/,/g, "")) || 0;

      // fitness percentage
      let fitness = entry.employee_fitness_percentage ?? "0";
      if (typeof fitness === "string") {
        fitness = parseFloat(fitness.replace("%", "")) || 0;
      }

      numerator += employeeCount * fitness;
      denominator += employeeCount;
    });

    if (denominator == 0) return "0%";

    return Math.round(numerator / denominator) + "%";
  }



  updateBE12Score(): void {
    const be12 = this.employees?.find((e: any) => e.goal_code === 'BE12');
    if (!be12) return;

    const score = this.calculateProgressIndicatorBE12();
    const parsedScore = score === 'Error'
      ? 0
      : (parseInt(score.replace('%', '')) || 0);


    if (!Array.isArray(be12.progress_indicators)) {
      be12.progress_indicators = [];
    }


    if (!be12.progress_indicators[0]) {
      be12.progress_indicators[0] = { score: 0 };
    }


    be12.progress_indicators[0].score = parsedScore;
  }



  calculateProgressIndicatorBE13(): string {
    const be13Data = this.EmployeeDetails?.be13_data || [];
    if (be13Data.length === 0) return '0%';

    let totalEmployees = 0;
    let weightedSum = 0;

    be13Data.forEach((entry: any) => {
      if (entry.relevance_id !== 1) return;

      // employeeCount same as component (fitnessnumber_of_employees)
      let employeeCount = entry.fitnessnumber_of_employees ?? entry.number_of_employees ?? 0;
      employeeCount = parseInt(employeeCount.toString().replace(/,/g, '')) || 0;

      // fitness same as component
      let fitnessValue = entry.employee_fitness_percentage;
      if (fitnessValue !== null && fitnessValue !== undefined) {
        if (typeof fitnessValue === 'string' && fitnessValue.includes('%')) {
          fitnessValue = parseFloat(fitnessValue.replace('%', '')) / 100;
        } else {
          fitnessValue = +fitnessValue / 100;
        }

        if (employeeCount > 0) {
          weightedSum += employeeCount * fitnessValue;
          totalEmployees += employeeCount;
        }
      }
    });

    return totalEmployees > 0
      ? Math.round((weightedSum / totalEmployees) * 100) + '%'
      : '0%';
  }



  updateBE13Score(): void {
    const be13 = this.employees?.find((e: any) => e.goal_code === 'BE13');
    if (!be13) return;

    const score = this.calculateProgressIndicatorBE13();
    const parsedScore = score === 'Error'
      ? 0
      : (parseInt(score.replace('%', '')) || 0);


    if (!Array.isArray(be13.progress_indicators)) {
      be13.progress_indicators = [];
    }


    if (!be13.progress_indicators[0]) {
      be13.progress_indicators[0] = { score: 0 };
    }


    be13.progress_indicators[0].score = parsedScore;
  }



  calculateProgressIndicatorBE14(): string {
    const be14Data = this.EmployeeDetails?.be14_data || [];
    if (be14Data.length == 0) return '0%';

    let totalIncludedEmployees = 0;
    let weightedFitnessSum = 0;

    be14Data.forEach((entry: any) => {
      if (entry.relevance_id !== 1) return;


      let employeeCount = entry.fitnessnumber_of_employees ?? entry.number_of_employees ?? 0;
      employeeCount = parseInt(employeeCount.toString().replace(/,/g, ''), 10) || 0;

      let fitness = entry.employee_fitness_percentage;
      if (fitness == null || fitness === undefined || employeeCount === 0) return;

      if (typeof fitness === 'string' && fitness.includes('%')) {
        fitness = parseFloat(fitness.replace('%', '')) / 100;
      } else {
        fitness = Number(fitness) / 100;
      }

      if (!isNaN(fitness)) {
        weightedFitnessSum += employeeCount * fitness;
        totalIncludedEmployees += employeeCount;
      }
    });

    if (totalIncludedEmployees == 0) return '0%';

    const average = weightedFitnessSum / totalIncludedEmployees;
    return Math.round(average * 100) + '%';
  }




  updateBE14Score(): void {
    const be14 = this.employees?.find((e: any) => e.goal_code === 'BE14');
    if (!be14) return;

    const score = this.calculateProgressIndicatorBE14();
    const parsedScore = score === 'Error'
      ? 0
      : (parseInt(score.replace('%', '')) || 0);


    if (!Array.isArray(be14.progress_indicators)) {
      be14.progress_indicators = [];
    }


    if (!be14.progress_indicators[0]) {
      be14.progress_indicators[0] = { score: 0 };
    }


    be14.progress_indicators[0].score = parsedScore;
  }


  calculateProgressIndicatorBE20(): string {
    const be20Data = this.EmployeeDetails?.be20_data || [];
    if (!be20Data.length) return '0%';

    const currentYear = new Date().getFullYear();

    let numerator = 0;
    let denominator = 0;

    be20Data.forEach((entry: any) => {
      if (entry.relevance_id != 1) return;


      const rawEmp = entry.number_of_employees ?? '0';
      const employeeCount = parseInt(rawEmp.toString().replace(/,/g, ''), 10) || 0;

      if (employeeCount <= 0) return;

      // Fitness Percentage
      let fitness = entry.employee_fitness_percentage ?? '0';
      if (typeof fitness === 'string' && fitness.includes('%')) {
        fitness = parseFloat(fitness.replace('%', '')) || 0;
      } else {
        fitness = Number(fitness) || 0;
      }

      numerator += employeeCount * fitness;
      denominator += employeeCount;
    });

    if (denominator == 0) return '0%';

    const weightedAvg = numerator / denominator;
    return Math.round(weightedAvg) + '%';
  }



  updateBE20Score(): void {
    const be20 = this.goverance?.find((e: any) => e.goal_code === 'BE20');
    if (!be20) return;

    const score = this.calculateProgressIndicatorBE20();
    const parsedScore = score === 'Error'
      ? 0
      : (parseInt(score.replace('%', '')) || 0);


    if (!Array.isArray(be20.progress_indicators)) {
      be20.progress_indicators = [];
    }


    if (!be20.progress_indicators[0]) {
      be20.progress_indicators[0] = { score: 0 };
    }

    //  SAFE UPDATE
    be20.progress_indicators[0].score = parsedScore;
  }



  calculateProgressIndicatorBE15(): string {
    const be15Data = this.ProductsDetails?.be15_data || [];
    if (!be15Data.length) return '';

    let totalIncludedRevenue = 0;
    let weightedFitnessSum = 0;

    be15Data.forEach((entry: any) => {
      if (entry.relevance_id !== 1) return;

      // Revenue from fitnessInputs equivalent (component source)
      let rawRevenue = entry.revenue ?? '0';
      const revenue = parseFloat(rawRevenue.toString().replace(/,/g, '')) || 0;


      let fitness = entry.product_fitness_percentage;
      if (fitness != null && fitness !== '') {
        if (typeof fitness === 'string' && fitness.includes('%')) {
          fitness = parseFloat(fitness.replace('%', '')) / 100;
        } else {
          fitness = Number(fitness) / 100;
        }

        if (!isNaN(fitness)) {
          weightedFitnessSum += revenue * fitness;
          totalIncludedRevenue += revenue;
        }
      }
    });

    if (totalIncludedRevenue == 0) return '';

    const avg = weightedFitnessSum / totalIncludedRevenue;
    return Math.round(avg * 100) + '%';
  }



  updateBE15Score(): void {
    const be15 = this.products?.find((p: any) => p.goal_code === 'BE15');
    if (!be15) return;

    const score = this.calculateProgressIndicatorBE15();
    const numericScore = typeof score === 'string'
      ? (score === 'Error' ? 0 : parseInt(score.replace('%', '')) || 0)
      : 0;


    if (!Array.isArray(be15.progress_indicators)) {
      be15.progress_indicators = [];
    }


    if (!be15.progress_indicators[0]) {
      be15.progress_indicators[0] = { score: 0 };
    }


    be15.progress_indicators[0].score = numericScore;
  }



  calculateProgressIndicatorBE16(): string {
    const be16Data = this.ProductsDetails?.be16_data || [];
    if (!be16Data.length) return '0%';

    const currentYear = new Date().getFullYear();

    let totalIncludedRevenue = 0;
    let weightedFitnessSum = 0;

    be16Data.forEach((entry: any) => {
      if (entry.relevance_id != 1) return;

      // Revenue comes directly from fitness input (component logic)
      const rawRevenue = entry.revenue ?? '0';
      const revenue = parseFloat(rawRevenue.toString().replace(/,/g, '')) || 0;


      let fitness = entry.product_fitness_percentage ?? '0%';
      if (typeof fitness === 'string' && fitness.includes('%')) {
        fitness = parseFloat(fitness.replace('%', '')) / 100;
      } else {
        fitness = Number(fitness) / 100;
      }

      if (!isNaN(fitness)) {
        weightedFitnessSum += revenue * fitness;
        totalIncludedRevenue += revenue;
      }
    });

    if (totalIncludedRevenue == 0) return '0%';

    const average = weightedFitnessSum / totalIncludedRevenue;
    return Math.round(average * 100) + '%';
  }



  updateBE16Score(): void {
    const be16 = this.products?.find((p: any) => p.goal_code === 'BE16');
    if (!be16) return;

    const score = this.calculateProgressIndicatorBE16();
    const parsedScore = score === 'Error'
      ? 0
      : (parseInt(score.replace('%', '')) || 0);


    if (!Array.isArray(be16.progress_indicators)) {
      be16.progress_indicators = [];
    }


    if (!be16.progress_indicators[0]) {
      be16.progress_indicators[0] = { score: 0 };
    }


    be16.progress_indicators[0].score = parsedScore;
  }


  calculateProgressIndicatorBE18(): string {
    const be18Data = this.ProductsDetails?.be18_data || [];
    if (!be18Data.length) return '';

    const currentYear = new Date().getFullYear();

    let numerator = 0;
    let denominator = 0;

    be18Data.forEach((entry: any) => {
      if (entry.relevance_id !== 1) return;

      // revenue from fitness input
      const rawRevenue = entry.revenue ?? '0';
      const revenue = parseFloat(rawRevenue.toString().replace(/,/g, '')) || 0;
      let fitness = entry.product_fitness_percentage ?? '0';

      if (typeof fitness === 'string' && fitness.includes('%')) {
        fitness = parseFloat(fitness.replace('%', '')) / 100;
      } else {
        fitness = Number(fitness) / 100;
      }

      if (!isNaN(fitness)) {
        numerator += revenue * fitness;
        denominator += revenue;
      }
    });

    if (denominator == 0) return '';

    const avg = numerator / denominator;
    return Math.round(avg * 100) + '%';
  }



  updateBE18Score(): void {
    const be18 = this.products?.find((p: any) => p.goal_code === 'BE18');
    if (!be18) return;

    const score = this.calculateProgressIndicatorBE18();
    const parsedScore = score === 'Error'
      ? 0
      : (parseInt(score.replace('%', '')) || 0);


    if (!Array.isArray(be18.progress_indicators)) {
      be18.progress_indicators = [];
    }


    if (!be18.progress_indicators[0]) {
      be18.progress_indicators[0] = { score: 0 };
    }


    be18.progress_indicators[0].score = parsedScore;
  }
  updateBE17Score(): void {
    const be17 = this.products?.find((p: any) => p.goal_code == 'BE17');
    if (!be17) return;

    if (!be17.progress_indicators) {
      be17.progress_indicators = [];
    }


    const s0 = this.calculateProgressIndicatorBE17(0);
    be17.progress_indicators[0] = {
      ...be17.progress_indicators[0],
      score: s0 === 'Error' ? 0 : parseInt(s0.replace('%', '')) || 0
    };


    const s1 = this.calculateProgressIndicatorBE17(1);
    be17.progress_indicators[1] = {
      ...be17.progress_indicators[1],
      score: s1 === 'Error' ? 0 : parseInt(s1.replace('%', '')) || 0
    };


    const s2 = this.calculateProgressIndicatorBE17(2);
    be17.progress_indicators[2] = {
      ...be17.progress_indicators[2],
      score: s2 === 'Error' ? 0 : parseInt(s2.replace('%', '')) || 0
    };


    const s3 = this.calculateProgressIndicatorBE17(3);
    be17.progress_indicators[3] = {
      ...be17.progress_indicators[3],
      score: s3 === 'Error' ? 0 : parseInt(s3.replace('%', '')) || 0
    };
  }




  private old_11_03_2026_calculateContextIndicatorBE17(index: number): number {
    const be17Data = this.ProductsDetails?.be17_data || [];
    let totalRevenue = 0;

    be17Data.forEach((entry: any) => {
      if (entry.relevance_id !== 1) return;

      const typeId = entry.product_type_id;
      const revenue = parseFloat(entry.revenue?.toString().replace(/,/g, "")) || 0;


      if ((index == 0 || index == 1) && (typeId == 1 || typeId == 2)) {
        totalRevenue += revenue;
      }


      if ((index == 2 || index == 3) && typeId == 3) {
        totalRevenue += revenue;
      }
    });

    return totalRevenue;
  }
  private calculateContextIndicatorBE17(index: number): number {
    const be17Data = this.ProductsDetails?.be17_data || [];
    let totalRevenue = 0;

    be17Data.forEach((entry: any) => {
      if (entry.relevance_id != 1) return;

      const revenue = Number(entry.revenue) || 0;

      const typeIds = Array.isArray(entry.product_type_id)
        ? entry.product_type_id
        : [entry.product_type_id];

      if ((index == 0 || index == 1) && (typeIds.includes(1) || typeIds.includes(2))) {
        totalRevenue += revenue;
      }

      if ((index == 2 || index == 3) && typeIds.includes(3)) {
        totalRevenue += revenue;
      }
    });

    return totalRevenue;
  }




  old_11_03_2026_calculateProgressIndicatorBE17(index: number): string {
    const be17Data = this.ProductsDetails?.be17_data || [];
    if (!be17Data.length) return "0%";

    let numerator = 0;

    be17Data.forEach((entry: any) => {
      if (entry.relevance_id !== 1) return;

      const typeId = entry.product_type_id;
      const revenue = parseFloat(entry.revenue?.toString().replace(/,/g, "")) || 0;

      let usePhase = entry.product_fitness_usephase ?? entry.GFUPUsePhase ?? 0;
      let endOfLife = entry.product_fitness_end ?? entry.GFUPendOfLife ?? 0;

      // Convert to fraction
      if (typeof usePhase === "string") {
        usePhase = parseFloat(usePhase.replace("%", "")) / 100;
      } else {
        usePhase = Number(usePhase) / 100;
      }

      if (typeof endOfLife === "string") {
        endOfLife = parseFloat(endOfLife.replace("%", "")) / 100;
      } else {
        endOfLife = Number(endOfLife) / 100;
      }

      // Sold or leased goods + Services
      if (index == 0 && (typeId == 1 || typeId == 2)) numerator += revenue * usePhase;
      if (index == 1 && (typeId == 1 || typeId == 2)) numerator += revenue * endOfLife;

      // Supplementary goods
      if (index == 2 && typeId == 3) numerator += revenue * usePhase;
      if (index == 3 && typeId == 3) numerator += revenue * endOfLife;
    });

    // Calculate denominator
    const denominator = this.calculateContextIndicatorBE17(index);
    if (!denominator) return "0%";

    return Math.round((numerator / denominator) * 100) + "%";
  }
  calculateProgressIndicatorBE17(index: number): string {
    const be17Data = this.ProductsDetails?.be17_data || [];
    if (!be17Data.length) return "0%";

    let numerator = 0;

    be17Data.forEach((entry: any) => {
      if (entry.relevance_id !== 1) return;

      // const typeId = entry.product_type_id;
      const typeIds = Array.isArray(entry.product_type_id)
        ? entry.product_type_id
        : [entry.product_type_id];
      const revenue = parseFloat(entry.revenue?.toString().replace(/,/g, "")) || 0;

      let usePhase = entry.product_fitness_usephase ?? entry.GFUPUsePhase ?? 0;
      let endOfLife = entry.product_fitness_end ?? entry.GFUPendOfLife ?? 0;

      // Convert to fraction
      if (typeof usePhase === "string") {
        usePhase = parseFloat(usePhase.replace("%", "")) / 100;
      } else {
        usePhase = Number(usePhase) / 100;
      }

      if (typeof endOfLife === "string") {
        endOfLife = parseFloat(endOfLife.replace("%", "")) / 100;
      } else {
        endOfLife = Number(endOfLife) / 100;
      }
      if (index == 0 && (typeIds.includes(1) || typeIds.includes(2)))
        numerator += revenue * usePhase;

      if (index == 1 && (typeIds.includes(1) || typeIds.includes(2)))
        numerator += revenue * endOfLife;

      if (index == 2 && typeIds.includes(3))
        numerator += revenue * usePhase;

      if (index == 3 && typeIds.includes(3))
        numerator += revenue * endOfLife;


    });

    // Calculate denominator
    const denominator = this.calculateContextIndicatorBE17(index);
    if (!denominator) return "0%";

    return Math.round((numerator / denominator) * 100) + "%";
  }

  old_11_03_2026_calculateProgressIndicatorBE19(index: number): string {

    const be19Data = this.ProductsDetails?.be19_data || [];
    if (!be19Data.length) return "0%";

    let numerator = 0;
    let denominator = 0;

    be19Data.forEach((entry: any) => {
      if (entry.relevance_id != 1) return;

      const typeId = entry.product_type_id;

      const isMatch =
        (index == 0 && typeId == 1) || // Sold / leased
        (index == 1 && typeId == 3);   // Supplementary

      if (!isMatch) return;

      const revenue = Number(entry.revenue) || 0;
      if (revenue <= 0) return;

      let fitness = entry.product_fitness_percentage || 0;

      if (typeof fitness === "string" && fitness.includes("%")) {
        fitness = parseFloat(fitness.replace("%", "")) || 0;
      }

      fitness = fitness / 100;

      numerator += revenue * fitness;
      denominator += revenue;
    });

    if (denominator == 0) return "0%";

    return Math.round((numerator / denominator) * 100) + "%";
  }
  calculateProgressIndicatorBE19(index: number): string {

    const be19Data = this.ProductsDetails?.be19_data || [];
    if (!be19Data.length) return "0%";

    let numerator = 0;
    let denominator = 0;

    be19Data.forEach((entry: any) => {

      if (entry.relevance_id != 1) return;

      const typeIds = Array.isArray(entry.product_type_id)
        ? entry.product_type_id
        : [entry.product_type_id];

      const isMatch =
        (index == 0 && typeIds.includes(1)) ||
        (index == 1 && typeIds.includes(3));

      if (!isMatch) return;

      const revenue = Number(entry.revenue) || 0;
      if (revenue <= 0) return;

      let fitness = entry.product_fitness_percentage || 0;

      if (typeof fitness === "string" && fitness.includes("%")) {
        fitness = parseFloat(fitness.replace("%", "")) || 0;
      }

      fitness = fitness / 100;

      numerator += revenue * fitness;
      denominator += revenue;

    });

    if (denominator == 0) return "0%";

    return Math.round((numerator / denominator) * 100) + "%";
  }


  updateBE19Score(): void {
    const be19 = this.products?.find((p: any) => p.goal_code === 'BE19');
    if (!be19) return;

    const score1 = this.calculateProgressIndicatorBE19(0);
    const score2 = this.calculateProgressIndicatorBE19(1);

    const value1 = score1 === 'Error' ? 0 : (parseInt(score1.replace('%', '')) || 0);
    const value2 = score2 === 'Error' ? 0 : (parseInt(score2.replace('%', '')) || 0);

    //  SAFE INITIALIZATION
    if (!Array.isArray(be19.progress_indicators)) {
      be19.progress_indicators = [];
    }

    //  Ensure row[0] exists
    if (!be19.progress_indicators[0]) {
      be19.progress_indicators[0] = { score: 0 };
    }

    //  Ensure row[1] exists
    if (!be19.progress_indicators[1]) {
      be19.progress_indicators[1] = { score: 0 };
    }

    //  SAFE UPDATES
    be19.progress_indicators[0].score = value1;
    be19.progress_indicators[1].score = value2;
  }


  calculateProgressIndicatorBE21(): string {

    const be21Data = this.SitesDetails?.be21_data || [];
    if (!be21Data.length) return '0%';

    const currentYear = new Date().getFullYear();

    let totalScore = 0;
    let totalSites = 0;

    // Helper functions
    const isYes = (val: any): boolean => {
      if (val === null || val === undefined) return false;
      if (typeof val === 'boolean') return val;
      if (typeof val === 'number') return val === 1;
      if (typeof val === 'string') {
        const v = val.trim().toLowerCase();
        return v === 'yes' || v === 'true' || v === '1';
      }
      return false;
    };

    const isNo = (val: any): boolean => {
      if (val === null || val === undefined) return false;
      if (typeof val === 'boolean') return !val;
      if (typeof val === 'number') return val === 0;
      if (typeof val === 'string') {
        const v = val.trim().toLowerCase();
        return v === 'no' || v === 'false' || v === '0';
      }
      return false;
    };

    // Groups
    const group1 = [
      'public_website',
      'public_tax_appointed',
      'public_tax_strategy',
      'public_tax_marketed',
      'public_tax_no_tax'
    ];

    const group2 = ['public_tax_direct'];

    const group3 = [
      'public_tax_stated',
      'public_tax_independent',
      'public_tax_discloses'
    ];

    const transparencyFields = [
      'transparency_company',
      'transparency_evidence',
      'transparency_address',
      'transparency_ultimate'
    ];

    const taxRateFields = [
      'taxrate_reconciliation',
      'taxrate_current',
      'taxrate_narrative',
      'taxrate_deferred'
    ];

    be21Data.forEach((entry: any) => {



      const isMNC = entry.companyis_mnc;
      const isMNCYes = isYes(isMNC);
      const isMNCNo = isNo(isMNC);

      if (!(isMNCYes || isMNCNo)) return;

      // Count YES in Group1 & Group3
      let yesCount = 0;
      [...group1, ...group3].forEach(field => {
        if (isYes(entry[field])) yesCount++;
      });

      // Group2 only if MNC = Yes
      if (isMNCYes) {
        group2.forEach(field => {
          if (isYes(entry[field])) yesCount++;
        });
      }

      // Transparency YES count
      let transparencyScore = 0;
      transparencyFields.forEach(field => {
        if (isYes(entry[field])) transparencyScore++;
      });

      // Taxrate YES count
      let taxrateScore = 0;
      taxRateFields.forEach(field => {
        if (isYes(entry[field])) taxrateScore++;
      });

      // Divisor logic
      const divisor = isMNCYes ? 17 : 16;

      const siteScore =
        (yesCount + transparencyScore + taxrateScore) / divisor;

      totalScore += siteScore;
      totalSites++;
    });

    if (totalSites == 0) return '0%';

    const average = totalScore / totalSites;
    return Math.round(average * 100) + '%';
  }


  updateBE21Score(): void {

    const be21 = this.goverance?.find((s: any) => s.goal_code === 'BE21');
    if (!be21) return;

    const score = this.calculateProgressIndicatorBE21();
    const parsedScore = score === 'Error'
      ? 0
      : (parseInt(score.replace('%', '')) || 0);

    if (!Array.isArray(be21.progress_indicators)) {
      be21.progress_indicators = [];
    }

    if (!be21.progress_indicators[0]) {
      be21.progress_indicators[0] = { score: 0 };
    }

    be21.progress_indicators[0].score = parsedScore;
  }
  updateBE22Score(): void {
    const be22 = this.goverance?.find((s: any) => s.goal_code === "BE22");
    if (!be22) return;

    if (!be22.progress_indicators) {
      be22.progress_indicators = [];
    }

    const score = this.calculateProgressIndicatorBE22();
    const numeric = score === "Error" ? 0 : parseInt(score.replace("%", "")) || 0;

    be22.progress_indicators[0] = {
      ...be22.progress_indicators[0],
      score: numeric
    };
  }


  calculateProgressIndicatorBE22(): string {
    let siteScore = 0;

    const be22Data = this.SitesDetails?.be22_data || [];
    if (!be22Data.length) return "0%";

    const isYes = (val: any): boolean => {
      if (val == null) return false;
      if (typeof val === "boolean") return val;
      if (typeof val === "number") return val === 1;
      if (typeof val === "string") {
        const v = val.trim().toLowerCase();
        return v === "yes" || v === "true" || v === "1";
      }
      return false;
    };

    const countYes = (obj: any, fields: string[]) =>
      fields.reduce((c, f) => c + (isYes(obj[f]) ? 1 : 0), 0);

    const lobbyingFields = [
      "Lobbying_seek_to_influence",
      "Lobbying_supporting_individuals",
      "Lobbying_specific_positions",
      "Lobbying_all_departments"
    ];

    const contributionFields = [
      "contributions_directly_undertake",
      "contributions_diligence_before",
      "contributions_recipient_engages",
      "contributions_due_diligence",
      "contributions_regular_review",
      "contributions_clear_guidance"
    ];

    const disclosureFields = [
      "disclosure_recipient_name",
      "disclosure_amount",
      "disclosure_date_of_contribution",
      "disclosure_company_raised"
    ];

    be22Data.forEach((entry: any) => {
      const V8 = countYes(entry, lobbyingFields);

      if (V8 == lobbyingFields.length) {
        siteScore = 0.33;

        const X8 = countYes(entry, contributionFields);
        if (X8 == contributionFields.length) {
          siteScore += 0.33;

          const Z8 = countYes(entry, disclosureFields);
          if (Z8 == disclosureFields.length) {
            siteScore += 0.34;
          }
        }
      } else {
        siteScore = 0;
      }
    });


    return Math.round(siteScore * 100) + "%";
  }




  calculateProgressIndicatorBE03(): string {
    if (!this.SitesDetails || !this.SitesDetails.be03_data || this.SitesDetails.be03_data.length === 0) {
      return '';
    }

    // Filter entries where relevance_id == 1
    const included = this.SitesDetails.be03_data.filter(
      (entry: any) => entry.relevance_id == 1
    );

    if (included.length === 0) return 'A';

    let numerator = 0;
    let denominator = 0;

    included.forEach((entry: any) => {
      const fitness = parseFloat(entry.resource_fitness_percent) || 0;
      const resourceValue = parseFloat(entry.value_of_natural_resource) || 0;
      numerator += fitness * resourceValue;
      denominator += resourceValue;
    });

    if (denominator === 0) return '';

    const result = numerator / denominator;
    return Math.round(result) + '%';
  }

  updateBE03Score(): void {
    const fitness = this.calculateProgressIndicatorBE03();
    const fitnessValue = fitness === 'Error'
      ? 0
      : (parseInt(fitness.replace('%', '')) || 0);

    const be03Site = this.Sites.find((site: any) => site.goal_code === 'BE03');
    if (!be03Site) return;


    if (!Array.isArray(be03Site.progress_indicators)) {
      be03Site.progress_indicators = [];
    }

    if (!be03Site.progress_indicators[0]) {
      be03Site.progress_indicators[0] = { score: 0 };
    }

    be03Site.progress_indicators[0].score = fitnessValue;
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

    const staticDataTypes: Record<string, string> = {
      user_forms: 'User Forms',
    };

    const isStaticType = Object.keys(staticDataTypes).includes(this.selectedDataType || '');

    const value = isStaticType
      ? { id: null, name: staticDataTypes[this.selectedDataType!] || 'All' }
      : this.selectedDataObject;
    let finalLabel = value.name;
    // if (this.selectedDataType === 'be_filled') {
    //   finalLabel = 'BE Form';
    // }
    const needsSelection = this.requiresSelection(this.selectedDataType);

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

  updateBE23Chart(be23Product: any, year: number): void {
    if (!be23Product) {
      console.warn("No BE23 product found");
      this.setEmptyBE23Chart("No BE23 data found for selected year");
      return;
    }

    const filteredIndicators =
      be23Product.progress_indicators?.filter((p: any) => this.getYear(p.year) == year) || [];

    if (!filteredIndicators.length) {
      this.setEmptyBE23Chart("No BE23 data found for selected year");
      return;
    }

    const apiDataMap = new Map<string, number>();
    filteredIndicators.forEach((item: any) => {
      const name = item.category_name?.trim();
      const score = Number(item.score) || 0;
      if (name) apiDataMap.set(name, score);
    });

    const categories = this.allCategories;
    const scores = categories.map((cat) => apiDataMap.get(cat) ?? 0);

    const colors = [
      '#29B6F6', '#66BB6A', '#FFCA28', '#EF5350',
      '#AB47BC', '#8D6E63', '#26C6DA', '#FFA726', '#7E57C2'
    ];

    this.be23ChartOptions = {
      series: [{ name: 'Score', data: scores }],
      chart: { type: 'bar', height: 450, toolbar: { show: false } },
      plotOptions: {
        bar: { horizontal: true, distributed: true, borderRadius: 5, barHeight: '80%' },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val}%`,
        style: { colors: ['#333'], fontSize: '13px', fontWeight: '600' },
      },
      colors: colors,


      xaxis: {
        categories: categories,
        labels: { style: { fontSize: '13px', colors: '#666' } },
        max: 100,
      },
      tooltip: { enabled: true, y: { formatter: (val: number) => `${val}%` } },
      title: {
        text: 'BE23 – Financial Assets (Category Progress)',
        align: 'left',
        style: { fontSize: '18px', fontWeight: 'bold', color: '#333' },
      },
      stroke: { width: 1, colors: ['#fff'] },
      yaxis: { labels: { style: { colors: '#666' } } },
      subtitle: { text: '', style: { fontSize: '12px', color: '#999' } },
    };

    this.be23ChartOptions = { ...this.be23ChartOptions };
  }

  setEmptyBE23Chart(message: string): void {
    this.be23ChartOptions = {
      series: [{ name: 'Score', data: Array(this.allCategories.length).fill(0) }],
      chart: { type: 'bar', height: 450, toolbar: { show: false } },
      plotOptions: { bar: { horizontal: true, distributed: true, borderRadius: 5 } },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val}%`,
        style: { colors: ['#555'], fontSize: '13px', fontWeight: '600' },
      },
      colors: ['#E0E0E0'],
      xaxis: {
        categories: this.allCategories,
        labels: { style: { fontSize: '13px' } },
        max: 100,
      },
      title: {
        text: `BE23 – Financial Assets (${message})`,
        align: 'left',
        style: { fontSize: '16px', color: '#777' },
      },
      stroke: { width: 1, colors: ['#fff'] },
      yaxis: { labels: { style: { colors: '#666' } } },
      subtitle: { text: '', style: { fontSize: '12px', color: '#999' } },
    };
  }


  updateBE04Chart(be04Site: any, year: number): void {
    if (!be04Site) {
      console.warn("No BE04 site found");
      this.setEmptyChart("No BE04 data found for selected year");
      return;
    }

    const filteredIndicators =
      be04Site.progress_indicators?.filter((p: any) => this.getYear(p.year) == year) || [];

    if (!filteredIndicators.length) {
      this.setEmptyChart("No BE04 data found for selected year");
      return;
    }

    const apiDataMap = new Map<string, number>();
    filteredIndicators.forEach((item: any) => {
      const name = item.category_name?.trim();
      const score = Number(item.score) || 0;
      if (name) apiDataMap.set(name, score);
    });

    const categories = this.allCategories;
    const scores = categories.map((cat) => apiDataMap.get(cat) ?? 0);

    const lightColors = [
      '#008FFB', '#00E396', '#FEB019', '#FF4560',
      '#775DD0', '#546E7A', '#26A69A', '#F86624', '#9C27B0'
    ];

    this.be04ChartOptions = {
      series: [{ name: 'Score', data: scores }],
      chart: { type: 'bar', height: 450, toolbar: { show: false } },
      plotOptions: {
        bar: { horizontal: true, distributed: true, borderRadius: 5, barHeight: '80%' },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val}%`,
        style: { colors: ['#333'], fontSize: '13px', fontWeight: '600' },
      },
      colors: lightColors,
      xaxis: {
        categories: categories,
        labels: { style: { fontSize: '13px', colors: '#666' } },
        max: 100,
      },
      tooltip: { enabled: true, y: { formatter: (val: number) => `${val}%` } },
      title: {
        text: 'BE04 – Procurement (Category Progress)',
        align: 'left',
        style: { fontSize: '18px', fontWeight: 'bold', color: '#333' },
      },
      stroke: { width: 1, colors: ['#fff'] },
      yaxis: { labels: { style: { colors: '#666' } } },


      subtitle: { text: '', style: { fontSize: '12px', color: '#999' } },
    };

    this.be04ChartOptions = { ...this.be04ChartOptions };
  }

  setEmptyChart(message: string): void {
    this.be04ChartOptions = {
      series: [{ name: 'Score', data: Array(this.allCategories.length).fill(0) }],
      chart: { type: 'bar', height: 450, toolbar: { show: false } },
      plotOptions: { bar: { horizontal: true, distributed: true, borderRadius: 5 } },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val}%`,
        style: { colors: ['#555'], fontSize: '13px', fontWeight: '600' },
      },
      colors: ['#E0E0E0'],
      xaxis: {
        categories: this.allCategories,
        labels: { style: { fontSize: '13px' } },
        max: 100,
      },
      title: {
        text: `BE04 – Procurement (${message})`,
        align: 'left',
        style: { fontSize: '16px', color: '#777' },
      },
      stroke: { width: 1, colors: ['#fff'] },
      yaxis: { labels: { style: { colors: '#666' } } },


      subtitle: { text: '', style: { fontSize: '12px', color: '#999' } },
    };
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
  deleteChart(index: number) {
    const removedItem = this.chartList[index];
    this.chartList.splice(index, 1);
  }


}
