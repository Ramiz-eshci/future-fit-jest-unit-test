import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { User, DataTable, Companys } from '../../models/datatable';
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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { UserService } from 'src/app/services/user.service';

interface TableConfig {
  title: string;
  columns: string[];
  data: any[];
}

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [MaterialModule, MatMenuModule, MatButtonModule, MatTabsModule, FormatColumnPipe, CommonModule, MatTableModule, MatPaginatorModule, RouterModule],
  templateUrl: './risk-profiler.component.html',
  styleUrl: './risk-profiler.component.scss'
})
export class RiskProfilerComponent {
  displayedColumns: string[] = [
    // "company_type_name",
    "company_name",
    "contact_number",
    "company_email",
    // "company_address",
    // "nra_score",
  ];

  companyTable: DataTable;

  totalData: number;
  CompanyDataTemp: any;
  CompanyData: Companys[];

  dataSource = new MatTableDataSource<Companys>();
  TABLE_CONFIG: Record<string, TableConfig> = {
    sector: {
      title: 'Sector',
      columns: ['sector_name'],
      data: [
        { sector_name: 'Technology' },
        { sector_name: 'Manufacturing' },
        { sector_name: 'Retail' },
        { sector_name: 'Energy' },
      ]
    },
    sub_sector: {
      title: 'Sub Sector',
      columns: ['sub_sector_name'],
      data: [
        { sub_sector_name: 'Software Development' },
        { sub_sector_name: 'Automotive' },
        { sub_sector_name: 'E-commerce' },
        { sub_sector_name: 'Renewable Energy' },
      ]
    },
    business_activity: {
      title: 'Business Activity',
      columns: ['business_activity'],
      data: [
        { business_activity: 'Cloud Services' },
        { business_activity: 'Electric Vehicles' },
        { business_activity: 'Online Marketplace' },
        { business_activity: 'Solar Power' },
      ]
    },
    characteristics: {
      title: 'Characteristics',
      columns: ['characteristics'],
      data: [
        { characteristics: "1.2 Our business's core activities are water-intensive" },
        { characteristics: '1.3 Our business uses water as a core product input' },
        { characteristics: '1.4 Our business uses water for personal consumption and basic sanitation purposes only' },
        { characteristics: '1.5 Our business uses natural resources at levels which may undermine their availability for local communities' },
      ]
    },
    logic: {
      title: 'Logic',
      columns: ['goal', 'type', 'risk'],
      data: [
        { goal: "BE01", type: 'Physical goods', risk: 'Low' },
        { goal: "BE02", type: 'Non Physical goods', risk: 'Modrate' },
        { goal: "BE03", type: 'Physical goods', risk: 'Low' },
        { goal: "BE04", type: 'Non Physical goods', risk: 'Low' },
        { goal: "BE05", type: 'Physical goods', risk: 'High' },
      ]
    },
    data: {
      title: 'Data',
      columns: ['business_activity', 'is_physical_goods_provider', 'characteristic_ID'],
      data: [
        { business_activity: "Accommodation services", is_physical_goods_provider: 'No', characteristic_ID: 'BI-1' },
        { business_activity: "Advertising services", is_physical_goods_provider: 'No', characteristic_ID: 'BI-1' },
        { business_activity: "Passenger air transportation", is_physical_goods_provider: 'No', characteristic_ID: 'BI-1' },
        { business_activity: "Animal rearing", is_physical_goods_provider: 'Yes', characteristic_ID: 'BI-1' },
        { business_activity: "Aquaculture", is_physical_goods_provider: 'Yes', characteristic_ID: 'BI-1' },
      ]
    },
    current_activity: {
      title: 'Data',
      columns: ['business_activity', 'ID', 'combined', 'risk_level', 'characteristics'],
      data: [
        { business_activity: "Fishing", ID: 'BI01', combined: 'FishingBI01', risk_level: 'Low', 'characteristics': 'Our business uses fossil fuels as a primary source of energy' },
        { business_activity: "Fishing", ID: 'BI02', combined: 'FishingBI02', risk_level: 'High', 'characteristics': "Our business's core activities are water-intensive" },
        { business_activity: "Fishing", ID: 'BI03', combined: 'FishingBI03', risk_level: 'High', 'characteristics': 'Our business uses water as a core product input' },
        { business_activity: "Fishing", ID: 'BI04', combined: 'FishingBI04', risk_level: 'Low', 'characteristics': 'Our business uses water for personal consumption and basic sanitation purposes only' },
        { business_activity: "Fishing", ID: 'BI05', combined: 'FishingBI05', risk_level: 'High', 'characteristics': 'Our business uses natural resources at levels which may undermine their availability for local communities' },
      ]
    },
  };
  isLoading = false;
  title = 'Company';
  RoleID: any = 1;
  constructor(
    private route: ActivatedRoute,
    public commonService: CommonService,
    public userService: UserService,
      private router: Router
  ) {
    this.RoleID = this.userService.RoleID;
    if (this.RoleID != 1) {
      this.router.navigate(['/']);
    }
  }
  filterValue = '';

  pageSizes = [5, 10, 25];


  @ViewChild(MatPaginator) paginator!: MatPaginator;


  ngAfterViewInit() {
    this.route.paramMap.subscribe((params: any) => {
      const type = params.get('type') || 'company';
      this.loadStaticTable(type);
    });
  }

  loadStaticTable(type: string) {
    const config = this.TABLE_CONFIG[type];

    if (!config) {
      console.error('Invalid table type:', type);
      return;
    }

    this.title = config.title;
    this.displayedColumns = config.columns;
    this.dataSource = new MatTableDataSource(config.data);
    this.totalData = config.data.length;

    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  deleteCompany(id: any) {
    Swal.fire('Static Mode', 'Delete action disabled for static data', 'info');
  }
}
