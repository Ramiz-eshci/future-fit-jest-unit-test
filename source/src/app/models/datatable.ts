export interface User {
  user_id: number;
  full_name: string;
  email: string;
  mobile_number: string;
}

export interface Role {
  role_id: number;
  role_name: number;
}

export interface DataTable {
  data: any[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}
export interface CompanyTypes {
  company_type_id: string;
  company_type_name: string;
  company_type_code: string;
}
export interface Companys {
  EventID: string;
  Name: string;
  Description: string;
  Image: string;
  StartDate: string;
  EndDate: string;
  EventLink: string;
}

export interface Sites {
  site_id: string;
  site_name: string;
}
export interface Employees {
  site_id: string;
  site_name: string;
}
export interface BreakEvenGoals {
  goal_id: string;
  goal_name: string;
  goal_code: string;
}
export interface Be01 {
  id: string;
  site_name: string;
  site_ID: string;
  location: string;
  relevance_id: string;
  fit_entry_id: string;
  site_id: string;
  amount_of_renewable_energy_used: string;
  total_amount_of_energy_used: string;
  site_fitness: string;
  comments: string;
  // EventLink: string;
}
export interface fit {
  fit_entry_id: string;
  fit_name: string;
  date: string;
  status_name: string;
}
export interface ResidualRisks {
  residual_risk_id: string;
  residual_risk: string;
  score_start_range: string;
  score_end_range: string;
}


export class RiskOwnerForm {
  riskOwner = '';
  riskDescriptor: RiskDescriptorForm[] = [];
  overAllScoringCategories: any[] = [];
}


export const MandateRiskLevel = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
}

export const aumCurrency = {
  GBP: 'GBP £',
  EUR: 'EUR €',
  USD: 'USD $',
}

export const STRATEGY_PERIODICITIES = {
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
}

export const StrategyTypes = {
  CONSTITUENT: 'Constituent',
  ADHOC: 'Ad-hoc',
  INACTIVE: 'Inactive',
}
export class StrategyTagForm {
  comment = '';
  tagId = '';
}


export class RiskDescriptorForm {
  RiskDescriptor = '';
  tvRiskElementsType = '';
  tvRiskElementsValue = '';
  consequence = '';
  causation = '';
  scoringCategories: any[] = [];
  inherent_tv='';
  inherent_tv_id='';
  causal_tv='';
  causal_tv_id='';
  impact_tv='';
  impact_tv_id='';
  bra_control_assessment_dtl_id=0
}


export enum MandateType {
  CONSTITUENT = 'CONSTITUENT',
  ADHOC = 'ADHOC',
  INACTIVE = 'INACTIVE',
}

export enum StrategyPeriodicity {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
}

export interface StrategyTag {
  comment: string;
  tagId: number;
  tagName: string;
}
export enum StrategyVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE', // Strategy mandate metrics are hidden from public
}
export interface SRA {
  sra_id: string;
  year: string;
  name_of_sra: string;
}
