export type HourlyRole = 'Supervisor' | 'Labor' | 'Surveyor' | 'Safety' | 'Rigger' | 'Crane Operator' | 'Carpenter';

export type HourlyCounts = Record<HourlyRole, number>;

export type SubcontractorEntry = {
  id: string;
  subcontractor: string;
  trade: string;
  quantity: number;
};

export type DailyReport = {
  id: string;
  project: string;
  workDate: string;
  enteredBy: string;
  status: 'Draft' | 'Submitted';
  notes: string;
  hourly: HourlyCounts;
  subcontractors: SubcontractorEntry[];
  createdAt: string;
  updatedAt: string;
};
