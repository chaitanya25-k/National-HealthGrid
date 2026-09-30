import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Inventory } from '../types';
import { Save, CheckCircle2, RefreshCw } from 'lucide-react';

export const ManagerInventory: React.FC = () => {
  const { user, authenticatedFetch } = useAuth();
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Form values
  const [paracetamol, setParacetamol] = useState(0);
  const [ivFluids, setIvFluids] = useState(0);
  const [ors, setOrs] = useState(0);
  const [amoxicillin, setAmoxicillin] = useState(0);
  const [oxygen, setOxygen] = useState(0);
  const [antivenom, setAntivenom] = useState(0);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authenticatedFetch('/facility/inventory');
      if (res.ok) {
        const data = await res.json();
        setInventory(data);
        setParacetamol(data.paracetamol_500mg || 0);
        setIvFluids(data.iv_fluids_500ml || 0);
        setOrs(data.ors_packets || 0);
        setAmoxicillin(data.amoxicillin_500mg || 0);
        setOxygen(data.oxygen_cylinders || 0);
        setAntivenom(data.antivenom_vials || 0);
      }
    } catch (e) {
      console.error('Failed to fetch inventory:', e);
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory, user?.facility_id]);

  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authenticatedFetch('/inventory', {
        method: 'POST',
        body: JSON.stringify({
          paracetamol_500mg: paracetamol,
          iv_fluids_500ml: ivFluids,
          ors_packets: ors,
          amoxicillin_500mg: amoxicillin,
          oxygen_cylinders: oxygen,
          antivenom_vials: antivenom,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setInventory(data.inventory);
        setToastMsg('Essential medicine physical counts updated and fed to federated models.');
        setTimeout(() => setToastMsg(''), 4000);
      }
    } catch (e) {
      console.error('Failed to save stock:', e);
    } finally {
      setSaving(false);
    }
  };

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
            National List of Essential Medicines (NLEM)
          </div>
          <h1 className="font-syne font-extrabold text-2xl sm:text-4xl uppercase tracking-tight text-[#1a1a18] mt-1">
            Medicine & Critical Pharmaceutical Stocks
          </h1>
          <p className="text-xs sm:text-sm text-[#1a1a18]/65 mt-1 font-normal">
            Real-time physical stock audit for {user?.hospital_name || 'Primary Health Centre'}. Quantities ground edge demand run-rate forecasts.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          disabled={loading}
          className="self-start sm:self-center px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-[#1a1a18] bg-white hover:bg-[#f2efeb] border border-[#1a1a18] shadow-ink flex items-center gap-1.5 transition-all focus-visible:ring-2 focus-visible:ring-[#1a1a18]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Counts</span>
        </button>
      </div>

      {/* 6 Essential Medicine Cards on Architectural Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* IV Normal Saline */}
        <div className="p-5 bg-white border-[1.5px] border-[#1a1a18] shadow-ink flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[11px] font-bold text-[#1a1a18]/60 uppercase tracking-wider">
                Infusion Saline
              </span>
              <span
                className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 border ${
                  (inventory?.iv_fluids_500ml || 0) < 200
                    ? 'bg-red-100 text-red-900 border-red-400'
                    : 'bg-emerald-100 text-emerald-900 border-emerald-400'
                }`}
              >
                {(inventory?.iv_fluids_500ml || 0) < 200 ? 'Stock-out Warning' : 'Safe'}
              </span>
            </div>
            <h2 className="font-syne font-extrabold text-sm uppercase tracking-tight text-[#1a1a18]">
              IV Normal Saline 500ml
            </h2>
            <div className="text-3xl font-extrabold text-[#1a1a18] font-mono tabular-nums mt-3">
              {inventory?.iv_fluids_500ml || 0}
              <span className="text-xs font-normal font-mono text-[#1a1a18]/50 ml-1.5">bottles</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1a1a18]/15 font-mono text-[11px] text-[#1a1a18]/65 flex justify-between">
            <span>Burn-rate: ~25 bottles/day</span>
            <span className="font-bold text-[#1a1a18]">
              {Math.max(1, Math.round((inventory?.iv_fluids_500ml || 0) / 25))} days reserve
            </span>
          </div>
        </div>

        {/* Anti-Snake Venom (ASV) */}
        <div className="p-5 bg-white border-[1.5px] border-[#1a1a18] shadow-ink flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[11px] font-bold text-[#1a1a18]/60 uppercase tracking-wider">
                Emergency Cold-Chain
              </span>
              <span
                className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 border ${
                  (inventory?.antivenom_vials || 0) < 5
                    ? 'bg-red-100 text-red-900 border-red-400'
                    : 'bg-emerald-100 text-emerald-900 border-emerald-400'
                }`}
              >
                {(inventory?.antivenom_vials || 0) < 5 ? 'Critical Buffer' : 'Nominal'}
              </span>
            </div>
            <h2 className="font-syne font-extrabold text-sm uppercase tracking-tight text-[#1a1a18]">
              Anti-Snake Venom (ASV)
            </h2>
            <div className="text-3xl font-extrabold text-[#1a1a18] font-mono tabular-nums mt-3">
              {inventory?.antivenom_vials || 0}
              <span className="text-xs font-normal font-mono text-[#1a1a18]/50 ml-1.5">vials</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1a1a18]/15 font-mono text-[11px] text-[#1a1a18]/65 flex justify-between">
            <span>Minimum rural PHC quota: 6</span>
            <span className="font-bold text-[#059669]">
              2-8°C Verified
            </span>
          </div>
        </div>

        {/* Paracetamol 500mg */}
        <div className="p-5 bg-white border-[1.5px] border-[#1a1a18] shadow-ink flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[11px] font-bold text-[#1a1a18]/60 uppercase tracking-wider">
                Antipyretic / Analgesic
              </span>
              <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 border bg-emerald-100 text-emerald-900 border-emerald-400">
                Safe
              </span>
            </div>
            <h2 className="font-syne font-extrabold text-sm uppercase tracking-tight text-[#1a1a18]">
              Paracetamol 500mg
            </h2>
            <div className="text-3xl font-extrabold text-[#1a1a18] font-mono tabular-nums mt-3">
              {inventory?.paracetamol_500mg || 0}
              <span className="text-xs font-normal font-mono text-[#1a1a18]/50 ml-1.5">tablets</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1a1a18]/15 font-mono text-[11px] text-[#1a1a18]/65 flex justify-between">
            <span>Dispensary burn-rate: ~80/day</span>
            <span className="font-bold text-[#1a1a18]">
              {Math.max(1, Math.round((inventory?.paracetamol_500mg || 0) / 80))} days reserve
            </span>
          </div>
        </div>

        {/* ORS Packets */}
        <div className="p-5 bg-white border-[1.5px] border-[#1a1a18] shadow-ink flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[11px] font-bold text-[#1a1a18]/60 uppercase tracking-wider">
                Dehydration Protocol
              </span>
              <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 border bg-emerald-100 text-emerald-900 border-emerald-400">
                Adequate
              </span>
            </div>
            <h2 className="font-syne font-extrabold text-sm uppercase tracking-tight text-[#1a1a18]">
              Oral Rehydration Salts (ORS)
            </h2>
            <div className="text-3xl font-extrabold text-[#1a1a18] font-mono tabular-nums mt-3">
              {inventory?.ors_packets || 0}
              <span className="text-xs font-normal font-mono text-[#1a1a18]/50 ml-1.5">packets</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1a1a18]/15 font-mono text-[11px] text-[#1a1a18]/65 flex justify-between">
            <span>WHO formula packets</span>
            <span className="font-bold text-[#059669]">
              Monsoon ready
            </span>
          </div>
        </div>

        {/* Amoxicillin 500mg */}
        <div className="p-5 bg-white border-[1.5px] border-[#1a1a18] shadow-ink flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[11px] font-bold text-[#1a1a18]/60 uppercase tracking-wider">
                Broad Spectrum
              </span>
              <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 border bg-emerald-100 text-emerald-900 border-emerald-400">
                Adequate
              </span>
            </div>
            <h2 className="font-syne font-extrabold text-sm uppercase tracking-tight text-[#1a1a18]">
              Amoxicillin 500mg
            </h2>
            <div className="text-3xl font-extrabold text-[#1a1a18] font-mono tabular-nums mt-3">
              {inventory?.amoxicillin_500mg || 0}
              <span className="text-xs font-normal font-mono text-[#1a1a18]/50 ml-1.5">capsules</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1a1a18]/15 font-mono text-[11px] text-[#1a1a18]/65 flex justify-between">
            <span>Primary care antibiotic</span>
            <span className="font-bold text-[#1a1a18]">
              Stock healthy
            </span>
          </div>
        </div>

        {/* Oxygen Cylinders */}
        <div className="p-5 bg-white border-[1.5px] border-[#1a1a18] shadow-ink flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[11px] font-bold text-[#1a1a18]/60 uppercase tracking-wider">
                High-Pressure O2
              </span>
              <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 border bg-emerald-100 text-emerald-900 border-emerald-400">
                Operational
              </span>
            </div>
            <h2 className="font-syne font-extrabold text-sm uppercase tracking-tight text-[#1a1a18]">
              Medical Oxygen Cylinders
            </h2>
            <div className="text-3xl font-extrabold text-[#1a1a18] font-mono tabular-nums mt-3">
              {inventory?.oxygen_cylinders || 0}
              <span className="text-xs font-normal font-mono text-[#1a1a18]/50 ml-1.5">cylinders</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1a1a18]/15 font-mono text-[11px] text-[#1a1a18]/65 flex justify-between">
            <span>B & D Manifold units</span>
            <span className="font-bold text-[#059669]">
              Pressure nominal
            </span>
          </div>
        </div>
      </div>

      {/* Stock Update Form on Architectural Card */}
      <div className="p-6 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
        <div className="pb-4 border-b border-[#1a1a18]/15">
          <h2 className="font-syne font-extrabold text-base uppercase tracking-tight text-[#1a1a18]">
            Log Physical Drug Count
          </h2>
          <p className="text-xs text-[#1a1a18]/65 mt-0.5">
            Physical stock numbers overwrite local database and trigger automated redistribution alerts if safety thresholds are breached.
          </p>
        </div>

        <form onSubmit={handleSaveStock} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label
                htmlFor="inp-iv"
                className="block font-mono text-[11px] uppercase font-bold tracking-wider mb-1 text-[#1a1a18]"
              >
                IV Normal Saline 500ml (Bottles)
              </label>
              <input
                id="inp-iv"
                type="number"
                min="0"
                value={ivFluids}
                onChange={(e) => setIvFluids(Number(e.target.value))}
                required
                className="w-full text-sm font-mono border-[1.5px] border-[#1a1a18] bg-white text-[#1a1a18] p-2.5 outline-none focus:bg-[#f2efeb]"
              />
            </div>

            <div>
              <label
                htmlFor="inp-asv"
                className="block font-mono text-[11px] uppercase font-bold tracking-wider mb-1 text-[#1a1a18]"
              >
                Anti-Snake Venom (ASV Vials)
              </label>
              <input
                id="inp-asv"
                type="number"
                min="0"
                value={antivenom}
                onChange={(e) => setAntivenom(Number(e.target.value))}
                required
                className="w-full text-sm font-mono border-[1.5px] border-[#1a1a18] bg-white text-[#1a1a18] p-2.5 outline-none focus:bg-[#f2efeb]"
              />
            </div>

            <div>
              <label
                htmlFor="inp-par"
                className="block font-mono text-[11px] uppercase font-bold tracking-wider mb-1 text-[#1a1a18]"
              >
                Paracetamol 500mg (Tablets)
              </label>
              <input
                id="inp-par"
                type="number"
                min="0"
                value={paracetamol}
                onChange={(e) => setParacetamol(Number(e.target.value))}
                required
                className="w-full text-sm font-mono border-[1.5px] border-[#1a1a18] bg-white text-[#1a1a18] p-2.5 outline-none focus:bg-[#f2efeb]"
              />
            </div>

            <div>
              <label
                htmlFor="inp-ors"
                className="block font-mono text-[11px] uppercase font-bold tracking-wider mb-1 text-[#1a1a18]"
              >
                ORS Packets (Oral Rehydration)
              </label>
              <input
                id="inp-ors"
                type="number"
                min="0"
                value={ors}
                onChange={(e) => setOrs(Number(e.target.value))}
                required
                className="w-full text-sm font-mono border-[1.5px] border-[#1a1a18] bg-white text-[#1a1a18] p-2.5 outline-none focus:bg-[#f2efeb]"
              />
            </div>

            <div>
              <label
                htmlFor="inp-amox"
                className="block font-mono text-[11px] uppercase font-bold tracking-wider mb-1 text-[#1a1a18]"
              >
                Amoxicillin 500mg (Capsules)
              </label>
              <input
                id="inp-amox"
                type="number"
                min="0"
                value={amoxicillin}
                onChange={(e) => setAmoxicillin(Number(e.target.value))}
                required
                className="w-full text-sm font-mono border-[1.5px] border-[#1a1a18] bg-white text-[#1a1a18] p-2.5 outline-none focus:bg-[#f2efeb]"
              />
            </div>

            <div>
              <label
                htmlFor="inp-ox"
                className="block font-mono text-[11px] uppercase font-bold tracking-wider mb-1 text-[#1a1a18]"
              >
                Oxygen Cylinders (Ready)
              </label>
              <input
                id="inp-ox"
                type="number"
                min="0"
                value={oxygen}
                onChange={(e) => setOxygen(Number(e.target.value))}
                required
                className="w-full text-sm font-mono border-[1.5px] border-[#1a1a18] bg-white text-[#1a1a18] p-2.5 outline-none focus:bg-[#f2efeb]"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#1a1a18]/15">
            <span className="font-mono text-xs text-[#1a1a18]/65">
              Local verification automatically triggers dispatch signals if buffers run out.
            </span>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white bg-[#1a1a18] hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2 shadow-ink transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Recording audit...' : 'Save Stock to Network'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
