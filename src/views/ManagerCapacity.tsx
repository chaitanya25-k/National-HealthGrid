import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Facility } from '../types';
import { Bed, CheckCircle2, Save, AlertTriangle, RefreshCw } from 'lucide-react';

export const ManagerCapacity: React.FC = () => {
  const { user, authenticatedFetch } = useAuth();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [bedsTotal, setBedsTotal] = useState(0);
  const [bedsAvailable, setBedsAvailable] = useState(0);
  const [icuAvailable, setIcuAvailable] = useState(0);

  const fetchCapacity = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authenticatedFetch('/facility/dashboard');
      if (res.ok) {
        const data = await res.json();
        const fac = data.facility;
        setFacility(fac);
        setBedsTotal(fac.beds_total || 0);
        setBedsAvailable(fac.beds_available || 0);
        setIcuAvailable(fac.icu_available || 0);
      }
    } catch (e) {
      console.error('Failed to load capacity:', e);
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  useEffect(() => {
    fetchCapacity();
  }, [fetchCapacity, user?.facility_id]);

  const handleSaveCapacity = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (bedsAvailable > bedsTotal) {
      setErrorMsg('Available beds cannot exceed total sanctioned beds.');
      return;
    }

    setSaving(true);
    try {
      const res = await authenticatedFetch('/capacity', {
        method: 'POST',
        body: JSON.stringify({
          beds_total: bedsTotal,
          beds_available: bedsAvailable,
          icu_available: icuAvailable,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setFacility((prev) => (prev ? { ...prev, ...data.facility } : prev));
        setToastMsg('Inpatient bed availability census updated successfully.');
        setTimeout(() => setToastMsg(''), 4000);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Failed to update capacity.');
      }
    } catch (e) {
      console.error('Failed to save capacity:', e);
      setErrorMsg('Network error saving bed counts.');
    } finally {
      setSaving(false);
    }
  };

  const occupied = Math.max(0, bedsTotal - bedsAvailable);
  const occupancyRate = bedsTotal > 0 ? Math.round((occupied / bedsTotal) * 100) : 0;

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

      {errorMsg && (
        <div
          role="alert"
          className="p-3 bg-red-50 text-red-900 border-[1.5px] border-red-600 text-xs font-mono font-bold flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#059669]">
            Inpatient Capacity & Triage Dispatch
          </div>
          <h1 className="font-syne font-extrabold text-2xl sm:text-4xl uppercase tracking-tight text-[#1a1a18] mt-1">
            Beds & Critical Care Census
          </h1>
          <p className="text-xs sm:text-sm text-[#1a1a18]/65 mt-1 font-normal">
            Maintain live unassigned bed availability for {facility?.name} across observation, maternity, and critical care units.
          </p>
        </div>

        <button
          onClick={fetchCapacity}
          disabled={loading}
          className="self-start sm:self-center px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-[#1a1a18] bg-white hover:bg-[#f2efeb] border border-[#1a1a18] shadow-ink flex items-center gap-1.5 transition-all focus-visible:ring-2 focus-visible:ring-[#1a1a18]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Census</span>
        </button>
      </div>

      {/* 4 Cards on Architectural Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
          <span className="font-mono text-xs font-bold text-[#1a1a18]/60 uppercase tracking-wider">
            Total Sanctioned Beds
          </span>
          <div className="text-3xl font-extrabold text-[#1a1a18] font-mono tabular-nums mt-2">
            {bedsTotal}
          </div>
          <span className="font-mono text-[11px] text-[#1a1a18]/60 mt-1 block uppercase">
            {facility?.tier === 'PHC' ? 'Observation & delivery' : 'General & special wards'}
          </span>
        </div>

        <div className="p-5 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
          <span className="font-mono text-xs font-bold text-[#059669] uppercase tracking-wider">
            Available for Admission
          </span>
          <div className="text-3xl font-extrabold text-[#059669] font-mono tabular-nums mt-2">
            {bedsAvailable}
          </div>
          <span className="font-mono text-[11px] text-[#059669] mt-1 block font-bold uppercase">
            Immediate admission buffer
          </span>
        </div>

        <div className="p-5 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
          <span className="font-mono text-xs font-bold text-[#1a1a18]/60 uppercase tracking-wider">
            Currently Occupied
          </span>
          <div className="text-3xl font-extrabold text-[#1a1a18] font-mono tabular-nums mt-2">
            {occupied}
          </div>
          <span className="font-mono text-[11px] text-[#1a1a18]/60 mt-1 block uppercase">
            {occupancyRate}% ward density
          </span>
        </div>

        <div className="p-5 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
          <span className="font-mono text-xs font-bold text-[#1a1a18]/70 uppercase tracking-wider">
            {facility?.tier === 'PHC' ? 'Stabilization Ready' : 'ICU Ventilator Ready'}
          </span>
          <div className="text-3xl font-extrabold text-[#1a1a18] font-mono tabular-nums mt-2">
            {icuAvailable}
          </div>
          <span className="font-mono text-[11px] text-[#059669] mt-1 block font-bold uppercase">
            Monitored units active
          </span>
        </div>
      </div>

      {/* Update Form on Architectural Card */}
      <div className="p-6 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
        <div className="pb-4 border-b border-[#1a1a18]/15">
          <h2 className="font-syne font-extrabold text-base uppercase tracking-tight text-[#1a1a18]">
            Shift Bed Census Log
          </h2>
          <p className="text-xs text-[#1a1a18]/65 mt-0.5">
            Submit physical counts from ward registers to keep district ambulance routing updated.
          </p>
        </div>

        <form onSubmit={handleSaveCapacity} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label
                htmlFor="beds-total"
                className="block font-mono text-[11px] uppercase font-bold tracking-wider mb-1 text-[#1a1a18]"
              >
                Total Sanctioned Beds
              </label>
              <input
                id="beds-total"
                type="number"
                min="0"
                value={bedsTotal}
                onChange={(e) => setBedsTotal(Number(e.target.value))}
                required
                className="w-full text-sm font-mono border-[1.5px] border-[#1a1a18] bg-white text-[#1a1a18] p-2.5 outline-none focus:bg-[#f2efeb]"
              />
            </div>

            <div>
              <label
                htmlFor="beds-avail"
                className="block font-mono text-[11px] uppercase font-bold tracking-wider mb-1 text-[#1a1a18]"
              >
                Available Beds (Unoccupied)
              </label>
              <input
                id="beds-avail"
                type="number"
                min="0"
                max={bedsTotal}
                value={bedsAvailable}
                onChange={(e) => setBedsAvailable(Number(e.target.value))}
                required
                className="w-full text-sm font-mono border-[1.5px] border-[#1a1a18] bg-white text-[#1a1a18] p-2.5 outline-none focus:bg-[#f2efeb]"
              />
            </div>

            <div>
              <label
                htmlFor="icu-avail"
                className="block font-mono text-[11px] uppercase font-bold tracking-wider mb-1 text-[#1a1a18]"
              >
                {facility?.tier === 'PHC' ? 'Emergency Stabilization Beds' : 'ICU Critical Care Beds'}
              </label>
              <input
                id="icu-avail"
                type="number"
                min="0"
                value={icuAvailable}
                onChange={(e) => setIcuAvailable(Number(e.target.value))}
                required
                className="w-full text-sm font-mono border-[1.5px] border-[#1a1a18] bg-white text-[#1a1a18] p-2.5 outline-none focus:bg-[#f2efeb]"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#1a1a18]/15">
            <span className="font-mono text-xs text-[#1a1a18]/65">
              Ward Occupancy: <strong className="font-mono text-[#1a1a18]">{occupancyRate}%</strong>
            </span>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white bg-[#1a1a18] hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2 shadow-ink transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Updating census...' : 'Save Census to Network'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
