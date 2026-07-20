import type { HourlyCounts, HourlyRole } from './types';

export const PROJECTS = [
  'Sky Living - Surry',
  'Sony Tower',
  'Prior St - Vancouver',
  'CCNE - Surry - Blue City',
  '10th & Discovery - Vancouver',
  'Uptown Phase 4',
  '1045 Burnaby',
  'Poor Italian'
];

export const HOURLY_ROLES: HourlyRole[] = [
  'Supervisor',
  'Labor',
  'Surveyor',
  'Safety',
  'Rigger',
  'Crane Operator',
  'Carpenter'
];

export const SUBCONTRACTORS = [
  'Muluk',
  'Leavitt Machinery',
  'Platinum',
  'Power Shotcrete',
  'Rappicone',
  'NRG',
  'Able'
];

export const emptyHourly = (): HourlyCounts => ({
  Supervisor: 0,
  Labor: 0,
  Surveyor: 0,
  Safety: 0,
  Rigger: 0,
  'Crane Operator': 0,
  Carpenter: 0
});
