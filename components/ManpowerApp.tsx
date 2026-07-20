'use client';

import { useEffect, useMemo, useState } from 'react';
import { HOURLY_ROLES, PROJECTS, SUBCONTRACTORS, emptyHourly } from '@/lib/constants';
import { hasSupabase } from '@/lib/supabase';
import { listReports, saveReport } from '@/lib/store';
import type { DailyReport, HourlyRole, SubcontractorEntry } from '@/lib/types';

const today = () => new Date().toISOString().slice(0, 10);
const uid = () => crypto.randomUUID();

function blankReport(): DailyReport {
  const now = new Date().toISOString();
  return {
    id: uid(), project: PROJECTS[0], workDate: today(), enteredBy: '', status: 'Draft', notes: '',
    hourly: emptyHourly(), subcontractors: [], createdAt: now, updatedAt: now
  };
}

export default function ManpowerApp() {
  const [tab, setTab] = useState<'entry' | 'dashboard'>('entry');
  const [report, setReport] = useState<DailyReport | null>(null);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const b = blankReport();
    setReport(b);
    listReports().then(setReports).catch(e => setMessage(e.message));
  }, []);

  const hourlyTotal = useMemo(() => report ? Object.values(report.hourly).reduce((a, b) => a + b, 0) : 0, [report]);
  const subTotal = useMemo(() => report ? report.subcontractors.reduce((a, b) => a + Number(b.quantity || 0), 0) : 0, [report]);

  if (!report) return <main className="shell"><p>Loading…</p></main>;

  const updateHourly = (role: HourlyRole, value: number) => setReport({ ...report, hourly: { ...report.hourly, [role]: Math.max(0, value) } });
  const addSub = () => setReport({ ...report, subcontractors: [...report.subcontractors, { id: uid(), subcontractor: '', trade: '', quantity: 0 }] });
  const updateSub = (id: string, patch: Partial<SubcontractorEntry>) => setReport({ ...report, subcontractors: report.subcontractors.map(s => s.id === id ? { ...s, ...patch } : s) });
  const removeSub = (id: string) => setReport({ ...report, subcontractors: report.subcontractors.filter(s => s.id !== id) });

  async function persist(status: 'Draft' | 'Submitted') {
    if (!report) return;
    const currentReport = report;
    setSaving(true); setMessage('');
    try {
      const updated: DailyReport = { ...currentReport, status, updatedAt: new Date().toISOString() };
      await saveReport(updated);
      setReport(updated);
      setReports(await listReports());
      setMessage(status === 'Submitted' ? 'Daily report submitted.' : 'Draft saved.');
    } catch (e: any) { setMessage(e.message || 'Unable to save.'); }
    finally { setSaving(false); }
  }

  function loadExisting(project: string, workDate: string) {
    const found = reports.find(r => r.project === project && r.workDate === workDate);
    if (found) setReport(found);
    else setReport({ ...blankReport(), project, workDate });
  }

  function copyPrevious() {
    if (!report) return;
    const currentReport = report;
    const previous = reports.filter(r => r.project === currentReport.project && r.workDate < currentReport.workDate).sort((a,b) => b.workDate.localeCompare(a.workDate))[0];
    if (!previous) return setMessage('No earlier report found for this project.');
    setReport({ ...blankReport(), project: currentReport.project, workDate: currentReport.workDate, enteredBy: currentReport.enteredBy, hourly: previous.hourly, subcontractors: previous.subcontractors.map(s => ({ ...s, id: uid() })) });
    setMessage('Previous report copied. Review quantities before saving.');
  }

  const submittedToday = reports.filter(r => r.workDate === today() && r.status === 'Submitted').length;
  const todayTotal = reports.filter(r => r.workDate === today()).reduce((sum, r) => sum + Object.values(r.hourly).reduce((a,b) => a+b,0) + r.subcontractors.reduce((a,b) => a+b.quantity,0), 0);

  return (
    <main className="shell">
      <header className="topbar">
        <div><p className="eyebrow">PR FORMING</p><h1>Manpower Tracker</h1></div>
        <div className="tabs"><button className={tab === 'entry' ? 'active' : ''} onClick={() => setTab('entry')}>Daily Entry</button><button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}>Dashboard</button></div>
      </header>

      {!hasSupabase && <div className="notice"><strong>Demo storage:</strong> records are saved in this browser. Connect Supabase before sharing with the team.</div>}
      {message && <div className="message">{message}</div>}

      {tab === 'entry' ? <>
        <section className="card meta-grid">
          <label>Project<select value={report.project} onChange={e => loadExisting(e.target.value, report.workDate)}>{PROJECTS.map(p => <option key={p}>{p}</option>)}</select></label>
          <label>Work date<input type="date" value={report.workDate} onChange={e => loadExisting(report.project, e.target.value)} /></label>
          <label>Entered by<input value={report.enteredBy} onChange={e => setReport({ ...report, enteredBy: e.target.value })} placeholder="Superintendent name" /></label>
          <label>Status<input value={report.status} readOnly /></label>
        </section>

        <section className="card">
          <div className="section-title"><div><p className="eyebrow">PART 1</p><h2>PR Forming Hourly Employees</h2></div><span className="total-pill">{hourlyTotal}</span></div>
          <div className="rows">
            {HOURLY_ROLES.map(role => <div className="data-row" key={role}><span>{role}</span><input aria-label={`${role} quantity`} type="number" min="0" value={report.hourly[role]} onChange={e => updateHourly(role, Number(e.target.value))} /></div>)}
            <div className="data-row total"><span>Total PR Forming manpower</span><strong>{hourlyTotal}</strong></div>
          </div>
        </section>

        <section className="card">
          <div className="section-title"><div><p className="eyebrow">PART 2</p><h2>Subcontractor Manpower</h2></div><span className="total-pill">{subTotal}</span></div>
          <div className="sub-head"><span>Subcontractor</span><span>Trade / crew</span><span>Qty</span><span></span></div>
          {report.subcontractors.map(s => <div className="sub-row" key={s.id}>
            <select value={s.subcontractor} onChange={e => updateSub(s.id, { subcontractor: e.target.value })}><option value="">Select company</option>{SUBCONTRACTORS.map(n => <option key={n}>{n}</option>)}</select>
            <input value={s.trade} onChange={e => updateSub(s.id, { trade: e.target.value })} placeholder="e.g. Concrete Finishers" />
            <input type="number" min="0" value={s.quantity} onChange={e => updateSub(s.id, { quantity: Math.max(0, Number(e.target.value)) })} />
            <button className="remove" onClick={() => removeSub(s.id)} aria-label="Remove subcontractor">×</button>
          </div>)}
          <button className="secondary" onClick={addSub}>+ Add subcontractor</button>
          <div className="grand-total"><span>Total site manpower</span><strong>{hourlyTotal + subTotal}</strong></div>
        </section>

        <section className="card"><label>Site notes<textarea rows={3} value={report.notes} onChange={e => setReport({ ...report, notes: e.target.value })} placeholder="Optional notes, delays, changes or safety observations" /></label></section>
        <div className="actions"><button className="secondary" onClick={copyPrevious}>Copy Previous Day</button><button className="secondary" disabled={saving} onClick={() => persist('Draft')}>Save Draft</button><button className="primary" disabled={saving || !report.enteredBy.trim()} onClick={() => persist('Submitted')}>Submit Daily Report</button></div>
      </> : <>
        <section className="stats"><div className="stat"><span>Submitted today</span><strong>{submittedToday} / {PROJECTS.length}</strong></div><div className="stat"><span>Total manpower today</span><strong>{todayTotal}</strong></div><div className="stat"><span>Missing today</span><strong>{PROJECTS.length - submittedToday}</strong></div></section>
        <section className="card"><div className="section-title"><h2>Recent reports</h2></div><div className="report-table"><div className="report-head"><span>Date</span><span>Project</span><span>Status</span><span>PR</span><span>Sub</span><span>Total</span></div>{reports.length === 0 ? <p className="empty">No reports yet.</p> : reports.map(r => { const h=Object.values(r.hourly).reduce((a,b)=>a+b,0); const s=r.subcontractors.reduce((a,b)=>a+b.quantity,0); return <button className="report-row" key={r.id} onClick={() => {setReport(r);setTab('entry')}}><span>{r.workDate}</span><span>{r.project}</span><span className={r.status === 'Submitted' ? 'status submitted' : 'status'}>{r.status}</span><span>{h}</span><span>{s}</span><strong>{h+s}</strong></button> })}</div></section>
      </>}
      <footer>PR Forming · Daily manpower records</footer>
    </main>
  );
}
