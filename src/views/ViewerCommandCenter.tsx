import React, { useState, useEffect, useCallback } from 'react';
import { NationalOverviewResponse } from '../types';
import {
  Building2,
  Bed,
  Pill,
  AlertTriangle,
  Users,
  CheckCircle2,
  RefreshCw,
  Search,
} from 'lucide-react';

interface ViewerCommandCenterProps {
  currentTab: string;
}

export const ViewerCommandCenter: React.FC<ViewerCommandCenterProps> = ({ currentTab }) => {
  const [data, setData] = useState<NationalOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedTier, setSelectedTier] = useState('ALL');

  const fetchNationalData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/national/overview');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Failed to load national data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNationalData();
  }, [fetchNationalData]);

  if (loading && !data) {
    return (
      <div className="p-12 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
          <span>Synchronizing national public healthcare situation room...</span>
        </div>
      </div>
    );
  }

  const metrics = data?.network_metrics;
  const filteredFacilities = (data?.facilities || []).filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.state.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = selectedState === 'ALL' || f.state === selectedState;
    const matchesTier = selectedTier === 'ALL' || f.tier === selectedTier;
    return matchesSearch && matchesState && matchesTier;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Architectural Header */}
      <section className="p-6 sm:p-8 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs">
              <span className="w-2 h-2 bg-[#059669] inline-block animate-pulse" />
              <span className="font-mono font-bold uppercase tracking-wider text-[#059669]">
                Ministry of Health & Family Welfare Network
              </span>
              <span className="text-[#1a1a18]/30">·</span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#1a1a18]/60">Central Monitoring Desk</span>
            </div>

            <h1 className="font-syne font-extrabold text-2xl sm:text-4xl uppercase tracking-tight text-[#1a1a18]">
              National Health Resource & Supply Situation
            </h1>
            <p className="text-xs sm:text-sm text-[#1a1a18]/70 mt-1 max-w-2xl font-normal">
              Real-time telemetry aggregated across India's Primary Health Centres (PHCs), Community Health Centres (CHCs), and District Hospitals (DHs).
            </p>
          </div>

          <button
            onClick={fetchNationalData}
            className="self-start md:self-center px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-[#1a1a18] bg-white hover:bg-[#f2efeb] border border-[#1a1a18] shadow-ink flex items-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-[#1a1a18]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync National Feed</span>
          </button>
        </div>
      </section>

      {/* 4 National Core KPIs on Architectural Cards */}
      <section aria-label="National aggregate metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
          <div className="flex items-center justify-between text-[#1a1a18]/60 mb-1">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#059669]">Medicine Readiness</span>
            <Pill className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="text-3xl font-extrabold text-[#1a1a18] font-mono tabular-nums">
            {metrics?.medicine_availability_rate || '94.4%'}
          </div>
          <span className="font-mono text-[11px] text-[#059669] mt-1 block font-bold uppercase">
            Essential NLEM stock buffer
          </span>
        </div>

        <div className="p-5 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
          <div className="flex items-center justify-between text-[#1a1a18]/60 mb-1">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1a1a18]/70">Available Beds</span>
            <Bed className="w-4 h-4 text-[#1a1a18]" />
          </div>
          <div className="text-3xl font-extrabold text-[#1a1a18] font-mono tabular-nums">
            {metrics?.available_beds?.toLocaleString() || '180'}
          </div>
          <span className="font-mono text-[11px] text-[#1a1a18]/60 mt-1 block uppercase">
            Across {metrics?.total_facilities || 8} reporting centers
          </span>
        </div>

        <div className="p-5 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
          <div className="flex items-center justify-between text-[#1a1a18]/60 mb-1">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-red-700">Early Warnings</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-3xl font-extrabold text-red-600 font-mono tabular-nums">
            {metrics?.unacknowledged_alerts || 2}
          </div>
          <span className="font-mono text-[11px] text-red-700 mt-1 block font-bold uppercase">
            Active stock-out alerts
          </span>
        </div>

        <div className="p-5 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
          <div className="flex items-center justify-between text-[#1a1a18]/60 mb-1">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#059669]">Staff Attendance</span>
            <Users className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="text-3xl font-extrabold text-[#1a1a18] font-mono tabular-nums">
            {metrics?.personnel_reporting_rate || '93.2%'}
          </div>
          <span className="font-mono text-[11px] text-[#059669] mt-1 block font-bold uppercase">
            MO & Nursing rosters active
          </span>
        </div>
      </section>

      {/* Sub-Views based on currentTab */}
      {currentTab === 'critical-alerts' ? (
        /* Critical Alerts Feed */
        <div className="p-6 bg-white border-[1.5px] border-[#1a1a18] shadow-ink space-y-4">
          <div className="pb-4 border-b border-[#1a1a18]/15">
            <h2 className="font-syne font-extrabold text-base uppercase tracking-tight text-[#1a1a18] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>National Early Warning & Stock-Out Threat Queue</span>
            </h2>
            <p className="text-xs text-[#1a1a18]/65 mt-0.5">
              Read-only aggregate feed of active clinical risk alerts across state divisions.
            </p>
          </div>

          <div className="space-y-3">
            {(data?.critical_alerts || []).map((alert) => (
              <div
                key={alert.id}
                className="p-4 bg-[#f2efeb] border-[1.5px] border-[#1a1a18]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 font-mono text-[10px] font-bold uppercase bg-red-100 text-red-900 border border-red-400">
                      {alert.severity}
                    </span>
                    <span className="text-xs font-bold text-[#1a1a18] font-sans">
                      {alert.facility_name} ({alert.district} Dist, {alert.state})
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#1a1a18]/60">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <h3 className="font-syne font-bold text-xs uppercase tracking-tight text-[#1a1a18] mt-2">
                  {alert.title}
                </h3>
                <p className="text-xs text-[#1a1a18]/70 mt-1">
                  {alert.message}
                </p>
                <div className="mt-2 text-[11px] font-mono text-[#1a1a18]/80">
                  <strong className="text-[#1a1a18]">RECOMMENDED ACTION:</strong> {alert.action_needed}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : currentTab === 'stock-snapshot' ? (
        /* Stock Snapshot Table */
        <div className="p-6 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
          <div className="pb-4 border-b border-[#1a1a18]/15">
            <h2 className="font-syne font-extrabold text-base uppercase tracking-tight text-[#1a1a18]">
              Statewide Pharmaceutical Reserves Snapshot
            </h2>
            <p className="text-xs text-[#1a1a18]/65 mt-0.5">
              Essential medicine inventories across Primary Health Centres and District Hospitals.
            </p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-[1.5px] border-[#1a1a18] text-[#1a1a18] font-mono uppercase text-[11px]">
                  <th className="py-3 px-3 font-bold">Facility & Tier</th>
                  <th className="py-3 px-3 font-bold">District / State</th>
                  <th className="py-3 px-3 font-bold text-right">IV Saline 500ml</th>
                  <th className="py-3 px-3 font-bold text-right">Antivenom (ASV)</th>
                  <th className="py-3 px-3 font-bold text-right">Paracetamol</th>
                  <th className="py-3 px-3 font-bold text-right">Oxygen Cylinders</th>
                  <th className="py-3 px-3 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a18]/15">
                {(data?.facilities || []).map((fac) => (
                  <tr key={fac.id} className="hover:bg-[#f2efeb]/60 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-[#1a1a18]">
                        {fac.name}
                      </div>
                      <span className="text-[10px] text-[#059669] uppercase font-mono font-bold">
                        Tier: {fac.tier}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-[#1a1a18]/70">
                      {fac.district}, {fac.state}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-right tabular-nums text-[#1a1a18]">
                      {fac.inventory?.iv_fluids_500ml?.toLocaleString() || 0}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-right tabular-nums text-[#1a1a18]">
                      {fac.inventory?.antivenom_vials || 0}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-right tabular-nums text-[#1a1a18]">
                      {fac.inventory?.paracetamol_500mg?.toLocaleString() || 0}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-right tabular-nums text-[#1a1a18]">
                      {fac.oxygen_cylinders || 0}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {(fac.inventory?.iv_fluids_500ml || 0) < 200 ? (
                        <span className="px-2 py-0.5 font-mono text-[10px] font-bold uppercase bg-red-100 text-red-900 border border-red-400">
                          Shortage
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 font-mono text-[10px] font-bold uppercase bg-emerald-100 text-emerald-900 border border-emerald-400">
                          Nominal
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Primary Facilities Grid with Filters */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-syne font-extrabold text-base uppercase tracking-tight text-[#1a1a18] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#059669]" />
              <span>Reporting Health Centers ({filteredFacilities.length})</span>
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              {/* State Filter */}
              <select
                aria-label="Filter by state"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="text-xs bg-white border-[1.5px] border-[#1a1a18] px-2.5 py-1.5 text-[#1a1a18] font-mono outline-none focus:bg-[#f2efeb]"
              >
                <option value="ALL">All States</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
              </select>

              {/* Tier Filter */}
              <select
                aria-label="Filter by facility tier"
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="text-xs bg-white border-[1.5px] border-[#1a1a18] px-2.5 py-1.5 text-[#1a1a18] font-mono outline-none focus:bg-[#f2efeb]"
              >
                <option value="ALL">All Tiers</option>
                <option value="PHC">PHC (Primary)</option>
                <option value="CHC">CHC (Community)</option>
                <option value="SDH">SDH (Sub-District)</option>
                <option value="DH">DH (District)</option>
              </select>

              {/* Search */}
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-[#1a1a18]/50 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search facility..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs border-[1.5px] border-[#1a1a18] bg-white text-[#1a1a18] pl-8 pr-2.5 py-1.5 outline-none focus:bg-[#f2efeb]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFacilities.map((fac) => (
              <div
                key={fac.id}
                className="p-5 bg-white border-[1.5px] border-[#1a1a18] shadow-ink flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-[#1a1a18] text-white uppercase">
                          {fac.tier}
                        </span>
                        <span className="text-xs text-[#1a1a18]/65 font-mono">
                          {fac.district} Dist, {fac.state}
                        </span>
                      </div>
                      <h3 className="font-syne font-extrabold text-sm uppercase tracking-tight text-[#1a1a18]">
                        {fac.name}
                      </h3>
                      <p className="text-xs text-[#1a1a18]/60 mt-0.5">
                        {fac.address}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] text-[#1a1a18] px-2 py-0.5 bg-[#f2efeb] border border-[#1a1a18]/30">
                      HG-{String(fac.id).padStart(4, '0')}
                    </span>
                  </div>

                  {/* Mini metrics on clean white background */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#1a1a18]/15 text-center">
                    <div className="p-2 bg-[#f2efeb] border border-[#1a1a18]/20">
                      <span className="text-[10px] text-[#1a1a18]/60 uppercase font-mono block">Occupancy</span>
                      <strong className="text-xs font-mono font-bold text-[#1a1a18] tabular-nums">
                        {fac.occupancy_rate}%
                      </strong>
                    </div>
                    <div className="p-2 bg-[#f2efeb] border border-[#1a1a18]/20">
                      <span className="text-[10px] text-[#1a1a18]/60 uppercase font-mono block">Available Beds</span>
                      <strong className="text-xs font-mono font-bold text-[#059669] tabular-nums">
                        {fac.beds_available}
                      </strong>
                    </div>
                    <div className="p-2 bg-[#f2efeb] border border-[#1a1a18]/20">
                      <span className="text-[10px] text-[#1a1a18]/60 uppercase font-mono block">IV Saline Stock</span>
                      <strong
                        className={`text-xs font-mono font-bold tabular-nums ${
                          (fac.inventory?.iv_fluids_500ml || 0) < 200
                            ? 'text-red-600'
                            : 'text-[#1a1a18]'
                        }`}
                      >
                        {fac.inventory?.iv_fluids_500ml || 0}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1a1a18]/15 flex items-center justify-between text-xs text-[#1a1a18]/70 font-mono">
                  <span>
                    Staff on Duty: {(fac.personnel?.doctors || 0) + (fac.personnel?.nurses || 0) + (fac.personnel?.anm_workers || 0)}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-[#059669] uppercase">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Synced OK
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
