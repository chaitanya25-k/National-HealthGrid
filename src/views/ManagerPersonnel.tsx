import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Personnel } from '../types';
import { Users, UserCheck, Stethoscope, Save, CheckCircle2, RefreshCw } from 'lucide-react';

export const ManagerPersonnel: React.FC = () => {
  const { user, authenticatedFetch } = useAuth();
  const [personnel, setPersonnel] = useState<Personnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Form states
  const [doctors, setDoctors] = useState(0);
  const [nurses, setNurses] = useState(0);
  const [anmWorkers, setAnmWorkers] = useState(0);
  const [pharmacists, setPharmacists] = useState(0);

  const fetchPersonnel = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authenticatedFetch('/facility/dashboard');
      if (res.ok) {
        const data = await res.json();
        const p = data.personnel;
        setPersonnel(p);
        setDoctors(p?.doctors || 0);
        setNurses(p?.nurses || 0);
        setAnmWorkers(p?.anm_workers || 0);
        setPharmacists(p?.pharmacists || 0);
      }
    } catch (e) {
      console.error('Failed to fetch personnel:', e);
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  useEffect(() => {
    fetchPersonnel();
  }, [fetchPersonnel, user?.facility_id]);

  const handleSavePersonnel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authenticatedFetch('/personnel', {
        method: 'POST',
        body: JSON.stringify({
          doctors,
          nurses,
          anm_workers: anmWorkers,
          pharmacists,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPersonnel(data.personnel);
        setToastMsg('Shift roster attendance synchronized to national workforce directory.');
        setTimeout(() => setToastMsg(''), 4000);
      }
    } catch (e) {
      console.error('Failed to save personnel:', e);
    } finally {
      setSaving(false);
    }
  };

  const totalStaff = doctors + nurses + anmWorkers + pharmacists;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast */}
      {toastMsg && (
        <div
          role="status"
          className="p-3 bg-emerald-50 text-emerald-900 border-[1.5px] border-[#059669] text-xs font-mono font-bold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-[#059669]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#059669]">
            Workforce Logistics & Shift Roster
          </div>
          <h1 className="font-syne font-extrabold text-2xl sm:text-4xl uppercase tracking-tight text-[#1a1a18] mt-1">
            Medical Personnel on Duty
          </h1>
          <p className="text-xs sm:text-sm text-[#1a1a18]/65 mt-1 font-normal">
            Daily verified shift attendance for Medical Officers, Staff Nurses (GNM), Auxiliary Nurse Midwives (ANM), and Pharmacists.
          </p>
        </div>

        <button
          onClick={fetchPersonnel}
          disabled={loading}
          className="self-start sm:self-center px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-[#1a1a18] bg-white hover:bg-[#f2efeb] border border-[#1a1a18] shadow-ink flex items-center gap-1.5 transition-all focus-visible:ring-2 focus-visible:ring-[#1a1a18]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Shift</span>
        </button>
      </div>

      {/* 4 Cards on Architectural Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
          <div className="flex items-center justify-between text-[#1a1a18]/60 mb-1">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#059669]">Medical Officers (MO)</span>
            <Stethoscope className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="text-3xl font-extrabold text-[#1a1a18] font-mono tabular-nums">
            {doctors}
          </div>
          <span className="font-mono text-[11px] text-[#1a1a18]/60 mt-1 block uppercase">MBBS / Specialists</span>
        </div>

        <div className="p-5 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
          <div className="flex items-center justify-between text-[#1a1a18]/60 mb-1">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#059669]">Staff Nurses (GNM)</span>
            <Users className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="text-3xl font-extrabold text-[#059669] font-mono tabular-nums">
            {nurses}
          </div>
          <span className="font-mono text-[11px] text-[#1a1a18]/60 mt-1 block uppercase">Ward & maternity care</span>
        </div>

        <div className="p-5 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
          <div className="flex items-center justify-between text-[#1a1a18]/60 mb-1">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1a1a18]/70">ANM Health Workers</span>
            <UserCheck className="w-4 h-4 text-[#1a1a18]" />
          </div>
          <div className="text-3xl font-extrabold text-[#1a1a18] font-mono tabular-nums">
            {anmWorkers}
          </div>
          <span className="font-mono text-[11px] text-[#1a1a18]/60 mt-1 block uppercase">Sub-centre outreach</span>
        </div>

        <div className="p-5 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
          <div className="flex items-center justify-between text-[#1a1a18]/60 mb-1">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#059669]">Pharmacists on Duty</span>
            <span className="font-mono text-[10px] font-bold text-[#059669] uppercase border border-[#059669] px-1">Active</span>
          </div>
          <div className="text-3xl font-extrabold text-[#1a1a18] font-mono tabular-nums">
            {pharmacists}
          </div>
          <span className="font-mono text-[11px] text-[#1a1a18]/60 mt-1 block uppercase">Dispensary managers</span>
        </div>
      </div>

      {/* Attendance Form on Architectural Card */}
      <div className="p-6 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
        <div className="pb-4 border-b border-[#1a1a18]/15">
          <h2 className="font-syne font-extrabold text-base uppercase tracking-tight text-[#1a1a18]">
            Log Shift Roster Attendance
          </h2>
          <p className="text-xs text-[#1a1a18]/65 mt-0.5">
            Submit verified headcount for the active shift to feed federated staffing adequacy models.
          </p>
        </div>

        <form onSubmit={handleSavePersonnel} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label
                htmlFor="staff-doc"
                className="block font-mono text-[11px] uppercase font-bold tracking-wider mb-1 text-[#1a1a18]"
              >
                Medical Officers (Doctors)
              </label>
              <input
                id="staff-doc"
                type="number"
                min="0"
                value={doctors}
                onChange={(e) => setDoctors(Number(e.target.value))}
                required
                className="w-full text-sm font-mono border-[1.5px] border-[#1a1a18] bg-white text-[#1a1a18] p-2.5 outline-none focus:bg-[#f2efeb]"
              />
            </div>

            <div>
              <label
                htmlFor="staff-nurse"
                className="block font-mono text-[11px] uppercase font-bold tracking-wider mb-1 text-[#1a1a18]"
              >
                Staff Nurses (GNM)
              </label>
              <input
                id="staff-nurse"
                type="number"
                min="0"
                value={nurses}
                onChange={(e) => setNurses(Number(e.target.value))}
                required
                className="w-full text-sm font-mono border-[1.5px] border-[#1a1a18] bg-white text-[#1a1a18] p-2.5 outline-none focus:bg-[#f2efeb]"
              />
            </div>

            <div>
              <label
                htmlFor="staff-anm"
                className="block font-mono text-[11px] uppercase font-bold tracking-wider mb-1 text-[#1a1a18]"
              >
                ANM Health Workers
              </label>
              <input
                id="staff-anm"
                type="number"
                min="0"
                value={anmWorkers}
                onChange={(e) => setAnmWorkers(Number(e.target.value))}
                required
                className="w-full text-sm font-mono border-[1.5px] border-[#1a1a18] bg-white text-[#1a1a18] p-2.5 outline-none focus:bg-[#f2efeb]"
              />
            </div>

            <div>
              <label
                htmlFor="staff-pharm"
                className="block font-mono text-[11px] uppercase font-bold tracking-wider mb-1 text-[#1a1a18]"
              >
                Pharmacists
              </label>
              <input
                id="staff-pharm"
                type="number"
                min="0"
                value={pharmacists}
                onChange={(e) => setPharmacists(Number(e.target.value))}
                required
                className="w-full text-sm font-mono border-[1.5px] border-[#1a1a18] bg-white text-[#1a1a18] p-2.5 outline-none focus:bg-[#f2efeb]"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#1a1a18]/15">
            <span className="font-mono text-xs text-[#1a1a18]/65">
              Total On-Duty Coverage: <strong className="font-mono text-[#1a1a18]">{totalStaff} Personnel</strong>
            </span>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white bg-[#1a1a18] hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2 shadow-ink transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Updating roster...' : 'Record Shift Attendance'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
