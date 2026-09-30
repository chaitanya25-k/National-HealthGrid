import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Facility, Inventory, Personnel } from '../types';
import {
  Bed,
  Pill,
  Users,
  Activity,
  CheckCircle2,
  Save,
  MapPin,
  RefreshCw,
  AlertTriangle,
  Building2,
} from 'lucide-react';

interface ManagerCommandCenterProps {
  onNavigateTab: (tabId: string) => void;
}

export const ManagerCommandCenter: React.FC<ManagerCommandCenterProps> = ({
  onNavigateTab,
}) => {
  const { user, authenticatedFetch } = useAuth();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [personnel, setPersonnel] = useState<Personnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Editable fields
  const [nameInput, setNameInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [tierInput, setTierInput] = useState('PHC');
  const [bedsTotalInput, setBedsTotalInput] = useState(0);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authenticatedFetch('/facility/dashboard');
      if (res.ok) {
        const data = await res.json();
        setFacility(data.facility);
        setInventory(data.inventory);
        setPersonnel(data.personnel);

        setNameInput(data.facility?.name || '');
        setAddressInput(data.facility?.address || '');
        setTierInput(data.facility?.tier || 'PHC');
        setBedsTotalInput(data.facility?.beds_total || 0);
      }
    } catch (e) {
      console.error('Failed to load facility data:', e);
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, user?.facility_id]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await authenticatedFetch('/facility/profile', {
        method: 'POST',
        body: JSON.stringify({
          name: nameInput,
          address: addressInput,
          tier: tierInput,
          beds_total: bedsTotalInput,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setFacility((prev) => (prev ? { ...prev, ...data.facility } : prev));
        setSuccessToast('Facility profile updated successfully.');
        setTimeout(() => setSuccessToast(''), 3000);
      }
    } catch (e) {
      console.error('Failed to update facility profile:', e);
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading && !facility) {
    return (
      <div className="p-12 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
          <span>Syncing facility operational state...</span>
        </div>
      </div>
    );
  }

  const bedsTotal = facility?.beds_total || 0;
  const bedsAvail = facility?.beds_available || 0;
  const occupied = Math.max(0, bedsTotal - bedsAvail);
  const occupancyRate = bedsTotal > 0 ? Math.round((occupied / bedsTotal) * 100) : 0;
  const icuAvail = facility?.icu_available || 0;
  const oxygenCount = facility?.oxygen_cylinders || inventory?.oxygen_cylinders || 0;
  const staffTotal =
    (personnel?.doctors || 0) +
    (personnel?.nurses || 0) +
    (personnel?.anm_workers || 0) +
    (personnel?.pharmacists || 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notice */}
      {successToast && (
        <div
          role="status"
          className="p-3 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Clean White Facility Header */}
      <section
        aria-labelledby="facility-overview-title"
        className="rounded-2xl p-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xs"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {facility?.tier || 'PHC'}
              </span>
              <span className="font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                {facility?.district} District, {facility?.state}
              </span>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span className="font-mono text-[#1a1a18]/60 text-[11px] uppercase">
                ID: HG-IN-{String(facility?.id || 1).padStart(4, '0')}
              </span>
            </div>

            <h1
              id="facility-overview-title"
              className="font-syne font-extrabold text-2xl sm:text-4xl uppercase tracking-tight text-[#1a1a18]"
            >
              {facility?.name || 'Primary Health Centre'}
            </h1>
            <p className="text-xs sm:text-sm text-[#1a1a18]/70 mt-1 font-normal font-sans">
              {facility?.address}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchDashboardData}
              aria-label="Refresh operational telemetry"
              className="px-3.5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-[#1a1a18] bg-white hover:bg-[#f2efeb] border border-[#1a1a18] shadow-ink flex items-center gap-1.5 transition-all focus-visible:ring-2 focus-visible:ring-[#1a1a18]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Status</span>
            </button>
            <button
              onClick={() => onNavigateTab('forecast')}
              className="px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white bg-[#1a1a18] hover:bg-black border border-[#1a1a18] shadow-ink transition-all focus-visible:ring-2 focus-visible:ring-[#1a1a18]"
            >
              Demand Prediction →
            </button>
          </div>
        </div>
      </section>

      {/* 4-Up Core KPI Stats Grid on Variation 2 Cards */}
      <section aria-label="Core operational metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bed Occupancy */}
        <div className="p-5 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
          <div className="flex items-center justify-between text-[#1a1a18]/60 mb-1">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#059669]">Bed Occupancy</span>
            <Bed className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="text-3xl font-extrabold text-[#1a1a18] font-mono tabular-nums">
            {occupancyRate}%
          </div>
          <div className="mt-2 text-xs flex items-center justify-between font-mono text-[#1a1a18]/65">
            <span>{bedsAvail} avail / {bedsTotal} total</span>
            <span
              className={`font-bold uppercase ${
                occupancyRate > 80 ? 'text-amber-700' : 'text-[#059669]'
              }`}
            >
              {occupancyRate > 80 ? 'High Inflow' : 'Nominal'}
            </span>
          </div>
        </div>

        {/* ICU / Emergency Beds */}
        <div className="p-5 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
          <div className="flex items-center justify-between text-[#1a1a18]/60 mb-1">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1a1a18]/70">
              {facility?.tier === 'PHC' ? 'Emergency Stabilize' : 'ICU Critical Ready'}
            </span>
            <Activity className="w-4 h-4 text-[#1a1a18]" />
          </div>
          <div className="text-3xl font-extrabold text-[#1a1a18] font-mono tabular-nums">
            {icuAvail}
          </div>
          <div className="mt-2 text-xs flex items-center justify-between font-mono text-[#1a1a18]/65">
            <span>Ventilator & Monitored</span>
            <span className="font-bold text-[#059669] uppercase">Ready</span>
          </div>
        </div>

        {/* Medical Oxygen */}
        <div className="p-5 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
          <div className="flex items-center justify-between text-[#1a1a18]/60 mb-1">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#059669]">Oxygen Reserve</span>
            <Activity className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="text-3xl font-extrabold text-[#1a1a18] font-mono tabular-nums">
            {oxygenCount}
            <span className="text-xs font-normal font-mono text-[#1a1a18]/50 ml-1.5">cylinders</span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between font-mono text-[#1a1a18]/65">
            <span>D-Type (47L high-pressure)</span>
            <span className="font-bold text-[#059669] uppercase">Active</span>
          </div>
        </div>

        {/* Core Antibiotic Stock */}
        <div className="p-5 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
          <div className="flex items-center justify-between text-[#1a1a18]/60 mb-1">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1a1a18]/70">Antibiotic Reserve</span>
            <Pill className="w-4 h-4 text-[#1a1a18]" />
          </div>
          <div className="text-3xl font-extrabold text-[#1a1a18] font-mono tabular-nums">
            {inventory?.amoxicillin_500mg || 0}
            <span className="text-xs font-normal font-mono text-[#1a1a18]/50 ml-1.5">caps</span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between font-mono text-[#1a1a18]/65">
            <span>Amoxicillin 500mg (NLEM)</span>
            <span className="font-bold text-[#059669] uppercase">Safe Buffer</span>
          </div>
        </div>
        {/* Workforce on Duty */}
        <div className="p-5 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
          <div className="flex items-center justify-between text-[#1a1a18]/60 mb-1">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#059669]">Workforce on Duty</span>
            <Users className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="text-3xl font-extrabold text-[#1a1a18] font-mono tabular-nums">
            {staffTotal}
          </div>
          <div className="mt-2 text-xs flex items-center justify-between font-mono text-[#1a1a18]/65">
            <span>
              {personnel?.doctors || 0} MO · {personnel?.nurses || 0} GNM · {personnel?.anm_workers || 0} ANM
            </span>
            <span className="font-bold text-[#059669] uppercase">Rostered</span>
          </div>
        </div>
      </section>

      {/* Main Grid: Medicine Readiness, 7-Day Trend, AI Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Readiness & Trend */}
        <div className="lg:col-span-2 space-y-6">
          {/* Essential Medicine (NLEM) Buffer Levels on Clean Architectural Card */}
          <div className="p-6 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
            <div className="flex items-center justify-between pb-4 border-b border-[#1a1a18]/15">
              <div>
                <h2 className="font-syne font-extrabold text-base uppercase tracking-tight text-[#1a1a18]">
                  Essential Medicines (NLEM) Buffer Margins
                </h2>
                <p className="text-xs text-[#1a1a18]/65 mt-0.5 font-normal">
                  Ground-truth dispensary counts measured against mandatory PHC safety reserve thresholds.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="font-mono text-xs font-bold uppercase tracking-wider text-[#059669] hover:underline"
              >
                Stock Log →
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {/* IV Normal Saline */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="font-sans text-[#1a1a18]">IV Normal Saline 500ml</span>
                  <span className="font-mono text-[#1a1a18]">
                    {inventory?.iv_fluids_500ml || 0} bottles{' '}
                    <span className="text-[#1a1a18]/50">
                      ({(inventory?.iv_fluids_500ml || 0) < (facility?.tier === 'PHC' ? 200 : 800) ? 'Critically Low' : 'Adequate'})
                    </span>
                  </span>
                </div>
                <div className="h-2 bg-[#f2efeb] border border-[#1a1a18]/20 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      (inventory?.iv_fluids_500ml || 0) < (facility?.tier === 'PHC' ? 200 : 800)
                        ? 'bg-red-600'
                        : 'bg-[#059669]'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(5, Math.round(((inventory?.iv_fluids_500ml || 0) / (facility?.tier === 'PHC' ? 500 : 3500)) * 100))
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Anti-Snake Venom (ASV) */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="font-sans text-[#1a1a18]">Anti-Snake Venom (ASV) Vials</span>
                  <span className="font-mono text-[#1a1a18]">
                    {inventory?.antivenom_vials || 0} vials (Cold-chain)
                  </span>
                </div>
                <div className="h-2 bg-[#f2efeb] border border-[#1a1a18]/20 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      (inventory?.antivenom_vials || 0) < 5 ? 'bg-amber-600' : 'bg-[#059669]'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(5, Math.round(((inventory?.antivenom_vials || 0) / 20) * 100))
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Paracetamol */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="font-sans text-[#1a1a18]">Paracetamol 500mg Tablets</span>
                  <span className="font-mono text-[#1a1a18]">
                    {inventory?.paracetamol_500mg || 0} tablets
                  </span>
                </div>
                <div className="h-2 bg-[#f2efeb] border border-[#1a1a18]/20 overflow-hidden">
                  <div
                    className="h-full bg-[#059669] transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(5, Math.round(((inventory?.paracetamol_500mg || 0) / (facility?.tier === 'PHC' ? 1500 : 8000)) * 100))
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* ORS Packets */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="font-sans text-[#1a1a18]">Oral Rehydration Salts (ORS Packets)</span>
                  <span className="font-mono text-[#1a1a18]">
                    {inventory?.ors_packets || 0} packets
                  </span>
                </div>
                <div className="h-2 bg-[#f2efeb] border border-[#1a1a18]/20 overflow-hidden">
                  <div
                    className="h-full bg-[#059669] transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(5, Math.round(((inventory?.ors_packets || 0) / (facility?.tier === 'PHC' ? 800 : 3000)) * 100))
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Inpatient & Outpatient Admission Inflow Curve */}
          <div className="p-6 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
            <div className="flex items-center justify-between pb-4 border-b border-[#1a1a18]/15">
              <div>
                <h2 className="font-syne font-extrabold text-base uppercase tracking-tight text-[#1a1a18]">
                  7-Day Bed Occupancy & Admission Trajectory
                </h2>
                <p className="text-xs text-[#1a1a18]/65 mt-0.5">
                  Real-time admissions vs. regional epidemiological baseline.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono uppercase font-bold">
                <span className="flex items-center gap-1.5 text-[#1a1a18]">
                  <span className="w-2.5 h-2.5 bg-[#059669]" /> Available Beds
                </span>
                <span className="flex items-center gap-1.5 text-[#1a1a18]">
                  <span className="w-2.5 h-2.5 bg-[#1a1a18]" /> Admission Inflow
                </span>
              </div>
            </div>

            <div className="mt-6 relative h-44 w-full" aria-label="7-Day capacity trajectory chart">
              <svg viewBox="0 0 700 170" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <line x1="0" y1="42" x2="700" y2="42" stroke="#1a1a18" strokeOpacity="0.15" strokeDasharray="3 3" />
                <line x1="0" y1="85" x2="700" y2="85" stroke="#1a1a18" strokeOpacity="0.15" strokeDasharray="3 3" />
                <line x1="0" y1="128" x2="700" y2="128" stroke="#1a1a18" strokeOpacity="0.15" strokeDasharray="3 3" />

                {/* Available Capacity (Emerald) */}
                <polyline
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  points="0,95 100,85 200,90 300,70 400,75 500,50 600,60 700,45"
                />

                {/* Demand Inflow Curve (Ink Black) */}
                <polyline
                  fill="none"
                  stroke="#1a1a18"
                  strokeWidth="2.5"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  strokeDasharray="4 2"
                  points="0,120 100,115 200,105 300,100 400,90 500,85 600,75 700,68"
                />

                <rect x="696" y="41" width="8" height="8" fill="#059669" />
                <rect x="696" y="64" width="8" height="8" fill="#1a1a18" />
              </svg>

              <div className="flex justify-between text-[11px] font-mono uppercase text-[#1a1a18]/60 mt-2">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: AI Attention Queue & Profile */}
        <div className="space-y-6">
          {/* AI Attention Queue */}
          <div className="p-6 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a1a18]/15">
              <h2 className="font-syne font-extrabold text-sm uppercase tracking-tight text-[#1a1a18] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>AI Attention Queue</span>
              </h2>
              <span className="text-[11px] font-bold text-[#059669] font-mono uppercase">
                3 Pending
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3.5 bg-[#f2efeb] border-[1.5px] border-red-600">
                <div className="flex items-center justify-between text-[11px] font-bold text-red-900 font-mono">
                  <span>IV SALINE BUFFER RUN-OUT</span>
                  <span className="text-[10px] text-red-700">CRITICAL</span>
                </div>
                <p className="text-xs text-[#1a1a18]/80 mt-1">
                  Run-rate exceeds threshold due to acute monsoon cases. Projected exhaustion in 28 hours.
                </p>
                <button
                  onClick={() => onNavigateTab('redistribution')}
                  className="mt-2 text-[11px] font-mono font-bold uppercase text-red-800 underline hover:no-underline"
                >
                  Authorize Cross-District Transfer →
                </button>
              </div>

              <div className="p-3.5 bg-[#f2efeb] border-[1.5px] border-amber-600">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 font-mono">
                  <span>ANTIVENOM COLD-CHAIN</span>
                  <span className="text-[10px] text-amber-700">WATCH</span>
                </div>
                <p className="text-xs text-[#1a1a18]/80 mt-1">
                  Vials reserve (4 remaining) below rural PHC protocol.
                </p>
                <button
                  onClick={() => onNavigateTab('inventory')}
                  className="mt-2 text-[11px] font-mono font-bold uppercase text-amber-800 underline hover:no-underline"
                >
                  Verify Reorder Requisition →
                </button>
              </div>

              <div className="p-3.5 bg-[#f2efeb] border-[1.5px] border-[#059669]">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#059669] font-mono">
                  <span>FEDERATED SURGE MULTIPLIER</span>
                  <span className="text-[10px]">ACTIVE</span>
                </div>
                <p className="text-xs text-[#1a1a18]/80 mt-1">
                  State model increased dengue drug stockpiling multiplier by 1.6x across Pune district.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Facility Master Profile Editor on Architectural Card */}
          <div className="p-6 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
            <div className="flex items-center gap-2 pb-3 border-b border-[#1a1a18]/15">
              <Building2 className="w-4 h-4 text-[#059669]" />
              <h2 className="font-syne font-extrabold text-sm uppercase tracking-tight text-[#1a1a18]">
                Facility Master Data
              </h2>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-3">
              <div>
                <label
                  htmlFor="fac-name"
                  className="block font-mono text-[11px] uppercase font-bold tracking-wider mb-1 text-[#1a1a18]"
                >
                  Facility Name
                </label>
                <input
                  id="fac-name"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  required
                  className="w-full text-xs border-[1.5px] border-[#1a1a18] bg-white text-[#1a1a18] px-3 py-2 outline-none focus:bg-[#f2efeb]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    htmlFor="fac-tier"
                    className="block font-mono text-[11px] uppercase font-bold tracking-wider mb-1 text-[#1a1a18]"
                  >
                    Facility Tier
                  </label>
                  <select
                    id="fac-tier"
                    value={tierInput}
                    onChange={(e) => setTierInput(e.target.value)}
                    className="w-full text-xs border-[1.5px] border-[#1a1a18] bg-white text-[#1a1a18] px-2 py-2 outline-none focus:bg-[#f2efeb]"
                  >
                    <option value="PHC">PHC (Primary)</option>
                    <option value="CHC">CHC (Community)</option>
                    <option value="SDH">SDH (Sub-District)</option>
                    <option value="DH">DH (District Hospital)</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="fac-beds"
                    className="block font-mono text-[11px] uppercase font-bold tracking-wider mb-1 text-[#1a1a18]"
                  >
                    Total Beds
                  </label>
                  <input
                    id="fac-beds"
                    type="number"
                    min="0"
                    value={bedsTotalInput}
                    onChange={(e) => setBedsTotalInput(Number(e.target.value))}
                    required
                    className="w-full text-xs font-mono border-[1.5px] border-[#1a1a18] bg-white text-[#1a1a18] px-3 py-2 outline-none focus:bg-[#f2efeb]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="fac-addr"
                  className="block font-mono text-[11px] uppercase font-bold tracking-wider mb-1 text-[#1a1a18]"
                >
                  Postal Address
                </label>
                <textarea
                  id="fac-addr"
                  rows={2}
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  required
                  className="w-full text-xs border-[1.5px] border-[#1a1a18] bg-white text-[#1a1a18] px-3 py-2 outline-none focus:bg-[#f2efeb] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-3 px-3 font-mono text-xs font-bold uppercase tracking-wider text-white bg-[#1a1a18] hover:bg-black disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors shadow-ink cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
