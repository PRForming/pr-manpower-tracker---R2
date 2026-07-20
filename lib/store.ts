import { hasSupabase, supabase } from './supabase';
import type { DailyReport } from './types';

const KEY = 'pr-forming-manpower-reports-v1';

function localReports(): DailyReport[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export async function listReports(): Promise<DailyReport[]> {
  if (!hasSupabase || !supabase) return localReports();
  const { data, error } = await supabase.from('daily_reports_view').select('*').order('work_date', { ascending: false });
  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.id,
    project: r.project_name,
    workDate: r.work_date,
    enteredBy: r.entered_by_name || r.entered_by_email || '',
    status: r.status,
    notes: r.notes || '',
    hourly: r.hourly || {},
    subcontractors: r.subcontractors || [],
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }));
}

export async function saveReport(report: DailyReport): Promise<void> {
  if (!hasSupabase || !supabase) {
    const all = localReports();
    const i = all.findIndex(r => r.project === report.project && r.workDate === report.workDate);
    if (i >= 0) all[i] = report; else all.unshift(report);
    localStorage.setItem(KEY, JSON.stringify(all));
    return;
  }

  const { data: project, error: projectError } = await supabase.from('projects').select('id').eq('name', report.project).single();
  if (projectError) throw projectError;

  const { data: saved, error } = await supabase.from('daily_reports').upsert({
    id: report.id,
    project_id: project.id,
    work_date: report.workDate,
    status: report.status.toLowerCase(),
    notes: report.notes,
    updated_at: new Date().toISOString()
  }, { onConflict: 'project_id,work_date' }).select('id').single();
  if (error) throw error;

  await supabase.from('hourly_entries').delete().eq('report_id', saved.id);
  await supabase.from('subcontractor_entries').delete().eq('report_id', saved.id);

  const hourlyRows = Object.entries(report.hourly).map(([role, quantity]) => ({ report_id: saved.id, role, quantity }));
  if (hourlyRows.length) {
    const { error: hourlyError } = await supabase.from('hourly_entries').insert(hourlyRows);
    if (hourlyError) throw hourlyError;
  }

  const subRows = report.subcontractors.filter(s => s.subcontractor && s.quantity >= 0).map(s => ({
    report_id: saved.id,
    subcontractor_name: s.subcontractor,
    trade: s.trade,
    quantity: s.quantity
  }));
  if (subRows.length) {
    const { error: subError } = await supabase.from('subcontractor_entries').insert(subRows);
    if (subError) throw subError;
  }
}
