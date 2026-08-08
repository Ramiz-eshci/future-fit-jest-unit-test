import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ApexTitleSubtitle, NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ChartType
} from 'ng-apexcharts';
import { CommonService } from 'src/app/services/common.service';
import { UserService } from 'src/app/services/user.service';
@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div *ngIf="chart && series.length && hasData; else noData">
      <!-- <h3>{{ title.text }}</h3> -->

      <apx-chart
        [series]="series"
        [chart]="chart"
        [xaxis]="xaxis"
        [labels]="labels"
        [title]="title">
      </apx-chart>
    </div>
    <ng-template #noData>
      <div class="no-data-message">
        <p>No data found for the selected criteria.</p>
      </div>
    </ng-template>
  `
})
export class ChartCardComponent implements OnInit, OnChanges {
  @Input() chartType: string | null = null;
  @Input() dataType: string | null = null;
  @Input() filterValue: any;
  @Input() filterLabel: string = '';

  series: ApexAxisChartSeries | number[] = [];
  chart!: ApexChart;
  xaxis: ApexXAxis = {};
  labels: string[] = [];
  title: ApexTitleSubtitle = { text: '' };
  hasData: boolean = false;
  constructor(public commonService: CommonService,
    public userService: UserService,
  ) {
  }
  ngOnInit(): void {
    const type = Array.isArray(this.chartType) ? this.chartType[0] : this.chartType;
    const context = Array.isArray(this.dataType) ? this.dataType[0] : this.dataType;
    // console.log(context, 'context')
    // console.log(type, 'type')
    // console.log(this.filterValue, 'this.filterValue')
    // console.log(this.filterLabel, 'this.filerLabel')
    this.setupChart(type, context, this.filterValue, this.filterLabel);

  }
  ngOnChanges(): void {
    // const type = Array.isArray(this.chartType) ? this.chartType[0] : this.chartType;
    // const context = Array.isArray(this.dataType) ? this.dataType[0] : this.dataType;
    // console.log(context, 'context')
    // console.log(type, 'type')
    // console.log(this.filterValue, 'this.filterValue')
    // this.setupChart(type, context, this.filterValue, this.filterLabel);
  }

  private setupChart(type: string | null, context: string | null, filter: any, label: string) {
    if (!type || !context) return;

    const chartType = type.toLowerCase() as ChartType;
    const isPie = chartType === 'pie' || chartType === 'donut';

    this.chart = {
      type: chartType, height: 300, toolbar: {
        show: true,
        tools: {
          download: false,   // disables download icon
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      }
    };
    // this.title = { text: `${this.getLabel(context)} Report (${type} Chart) for ${label}` };

    const knownLabels = ['bra_status', 'risk_owner'];
    const displayLabel = knownLabels.includes(context || '') ? label : 'Latest BRA';
    const labels = this.getLabel(context)
    if (context == 'bra_status') {
      this.title = {
        text: `${labels} Report`
      };
    } else {
      const labels = this.getLabel(context)
      this.title = {
        text: `${labels} Report`
      };
    }

    switch (context) {
      case 'be_filled':
        this.commonService.getData('reports/get-sep-data/' + filter).subscribe((response) => {
          if (response.status === true) {
            this.hasData = true;
            const item = response.data; // You can loop if there are multiple owners
            this.labels = [
              'Filled',
              'Not Filled',
            ];

            if (isPie) {
              this.series = [
                parseFloat(item.filled.toFixed(2)),
                parseFloat(item.notFilled.toFixed(2)),
                // parseFloat(item.notFilled.toFixed(2)),
                // parseFloat(item.avg_internal_mitigations.toFixed(2)),
                // parseFloat(item.avg_compliance_score.toFixed(2)),
                // parseFloat(item.avg_effectiveness_score.toFixed(2)),
                // parseFloat(item.final_score.toFixed(2))
              ];
              this.xaxis = {}; // Not needed for pie
            } else {
              this.series = [
                {
                  // name: item.name,
                  data: [
                    parseFloat(item.filled),
                    parseFloat(item.notFilled),
                    // parseFloat(item.avg_external_threat.toFixed(2)),
                    // parseFloat(item.avg_internal_mitigations.toFixed(2)),
                    // parseFloat(item.avg_compliance_score.toFixed(2)),
                    // parseFloat(item.avg_effectiveness_score.toFixed(2)),
                    // parseFloat(item.final_score.toFixed(2))
                  ]
                }
              ];
              this.xaxis = { categories: this.labels };
            }
          } else {
            this.hasData = false;
          }
        });
        // this.labels = ['Low', 'Medium', 'High'];
        // this.series = isPie
        //   ? [3, 5, 2]
        //   : [{ name: 'Risk Count', data: [3, 5, 2] }];
        break;
      case 'bra_status':
        this.commonService.getData('report/status-wise').subscribe((response) => {
          if (response.status === true) {
            this.hasData = true;
            this.labels = response.data.map((d: { status: string; count: number }) => d.status);
            const counts = response.data.map((d: { status: string; count: number }) => d.count);

            this.series = isPie
              ? counts
              : [{ name: 'BRA Count', data: counts }];

            this.xaxis = isPie ? {} : { categories: this.labels };
            this.series = isPie
              ? counts
              : [{ name: 'BRA Count', data: counts }];
          } else {
            this.hasData = false;
          }
        });

        break;
      case 'gross_total':
        this.commonService.getData('report/latestBRAGrossTotalRiskOwners/' + context).subscribe((response) => {
          if (response.status === true) {
            this.hasData = true;
            this.labels = response.data.map((d: { name: string; score: number }) => d.name);
            const counts = response.data.map((d: { status: string; score: number }) => d.score);

            this.series = isPie
              ? counts
              : [{ name: labels, data: counts }];

            this.xaxis = isPie ? {} : { categories: this.labels };
            this.series = isPie
              ? counts
              : [{ name: labels, data: counts }];
          } else {
            this.hasData = false;
          }
        });
        break;
      case 'user_forms':
        this.commonService.getData('reports/get-user-data').subscribe((response) => {
          if (response.status === true) {
            this.hasData = true;
            // this.labels = ['BE01', 'BE02', 'BE05', 'BE14'];
            // const counts = [5, 20, 10, 8];
            const filtered = response.data[0]

            this.labels = response.data.map((u: { name: any; }) => u.name);          // ['Test TEst', 'user Test']
            const counts = response.data.map((u: { formsFilled: any; }) => u.formsFilled);

            this.series = isPie
              ? counts
              : [{ name: labels, data: counts }];

            this.xaxis = isPie ? {} : { categories: this.labels };
            this.series = isPie
              ? counts
              : [{ name: labels, data: counts }];
          }
        });

        break;
      case 'abc':
        this.hasData = true;
        this.labels = ['BE01', 'BE02', 'BE05', 'BE14'];
        const counts2 = [10, 20, 30, 20];

        this.series = isPie
          ? counts2
          : [{ name: labels, data: counts2 }];

        this.xaxis = isPie ? {} : { categories: this.labels };
        this.series = isPie
          ? counts2
          : [{ name: labels, data: counts2 }];
        break;
      case 'effectiveness_residual':
        this.commonService.getData('report/latestBRAGrossTotalRiskOwners/' + context).subscribe((response) => {
          if (response.status === true) {
            this.hasData = true;
            this.labels = response.data.map((d: { name: string; score: number }) => d.name);
            const counts = response.data.map((d: { status: string; score: number }) => d.score);

            this.series = isPie
              ? counts
              : [{ name: labels, data: counts }];

            this.xaxis = isPie ? {} : { categories: this.labels };
            this.series = isPie
              ? counts
              : [{ name: labels, data: counts }];
          } else {
            this.hasData = false;
          }
        });
        break;


      default:
        this.series = [];
        this.labels = [];
        this.xaxis = {};
        return;
    }

    this.xaxis = isPie ? {} : { categories: this.labels };
  }

  private getLabel(context: string): string {
    switch (context) {
      case 'risk_owner': return 'Risk Owner';
      case 'gross_total': return 'Gross Total';
      case 'user_forms': return 'User BE Forms';
      case 'be_filled': return 'BE Form ';
      case 'effectiveness_residual': return 'Effectiveness Residual';
      case 'bra_status': return 'BRA Status';
      default: return 'Unknown';
    }
  }

}
