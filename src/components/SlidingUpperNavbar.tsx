import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Pill,
  Bed,
  Users,
  Sparkles,
  ArrowRightLeft,
  Share2,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Building2,
  ChevronDown,
} from 'lucide-react';

interface SlidingUpperNavbarProps {
  currentView: string;
  onSelectView: (viewId: string) => void;
}

export const SlidingUpperNavbar: React.FC<SlidingUpperNavbarProps> = ({
  currentView,
  onSelectView,
}) => {
  const { user, switchFacility } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const managerNav = [
    { id: 'command', label: 'Command Center', icon: LayoutDashboard, hotkey: '1' },
    { id: 'inventory', label: 'Medicines (NLEM)', icon: Pill, hotkey: '2' },
    { id: 'capacity', label: 'Beds & ICU', icon: Bed, hotkey: '3' },
    { id: 'personnel', label: 'Staff Shifts', icon: Users, hotkey: '4' },
    { id: 'forecast', label: 'Demand Forecast', icon: Sparkles, hotkey: '5' },
    { id: 'redistribution', label: 'Transfers', icon: ArrowRightLeft, hotkey: '6' },
    { id: 'federated', label: 'Federated Models', icon: Share2, hotkey: '7' },
  ];

  const viewerNav = [
    { id: 'national-overview', label: 'National Situation', icon: LayoutDashboard, hotkey: '1' },
    { id: 'critical-alerts', label: 'Early Warnings', icon: Sparkles, hotkey: '2' },
    { id: 'stock-snapshot', label: 'Medicine Balance', icon: Pill, hotkey: '3' },
    { id: 'federated', label: 'Federated Consensus', icon: Share2, hotkey: '4' },
    { id: 'redistribution', label: 'Redistribution Orders', icon: ArrowRightLeft, hotkey: '5' },
  ];

  const navItems = user?.role === 'viewer' ? viewerNav : managerNav;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -220 : 220;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const phcFacilities = [
    { id: 2, name: 'Junnar Rural PHC (Pune, MH)', tier: 'PHC' },
    { id: 1, name: 'Aundh District Hospital (Pune, MH)', tier: 'DH' },
    { id: 3, name: 'Baramati SDH (Pune, MH)', tier: 'SDH' },
    { id: 5, name: 'Trimbakeshwar CHC (Nashik, MH)', tier: 'CHC' },
    { id: 4, name: 'Nashik Civil DH (Nashik, MH)', tier: 'DH' },
    { id: 7, name: 'Achalpur Rural PHC (Amravati, MH)', tier: 'PHC' },
    { id: 6, name: 'Amravati General DH (Amravati, MH)', tier: 'DH' },
    { id: 8, name: 'Kanakapura Taluk CHC (Karnataka)', tier: 'CHC' },
  ];

  return (
    <>
      {/* Sliding Upper Command Bar with Variation 2 Architectural Aesthetic */}
      <nav
        aria-label="Upper Sliding Navigation"
        className="bg-[#f2efeb] border-b-[1.5px] border-[#1a1a18] transition-colors sticky top-16 z-20"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center h-12 gap-2">
          {/* Key to Left Side: Sliding Drawer Trigger */}
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-label="Slide out navigation drawer"
            title="Slide Out Workspace Console (Alt+M)"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#f2efeb] text-[#1a1a18] border border-[#1a1a18] shadow-ink transition-all shrink-0 font-mono text-[11px] font-bold uppercase focus-visible:ring-2 focus-visible:ring-[#1a1a18]"
          >
            <Menu className="w-3.5 h-3.5 text-[#1a1a18]" />
            <span className="hidden sm:inline">Slide Bar</span>
            <span className="text-[10px] text-[#1a1a18]/60 font-mono">◀▶</span>
          </button>

          {/* Left Arrow Scroll */}
          <button
            onClick={() => scroll('left')}
            aria-label="Slide navigation left"
            className="p-1 border border-[#1a1a18]/30 hover:border-[#1a1a18] bg-white text-[#1a1a18] shrink-0 hidden md:flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Horizontal Sliding Track */}
          <div
            ref={scrollRef}
            className="flex-1 flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 px-1 scroll-smooth"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase font-bold whitespace-nowrap shrink-0 transition-all focus-visible:ring-2 focus-visible:ring-[#1a1a18] ${
                    isActive
                      ? 'bg-white text-[#1a1a18] border border-[#1a1a18] shadow-ink'
                      : 'bg-transparent text-[#1a1a18]/65 hover:text-[#1a1a18] hover:bg-white/60 border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? 'text-[#059669]' : 'text-[#1a1a18]/50'
                    }`}
                  />
                  <span>{item.label}</span>
                  <span className="text-[10px] text-[#1a1a18]/40 font-mono ml-0.5">
                    {item.hotkey}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Arrow Scroll */}
          <button
            onClick={() => scroll('right')}
            aria-label="Slide navigation right"
            className="p-1 border border-[#1a1a18]/30 hover:border-[#1a1a18] bg-white text-[#1a1a18] shrink-0 hidden md:flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Active Facility Quick Pill */}
          {user?.role === 'manager' && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#1a1a18]/30 font-mono text-[11px] text-[#1a1a18] shrink-0">
              <Building2 className="w-3.5 h-3.5 text-[#059669]" />
              <span className="font-bold text-[#1a1a18] max-w-[150px] truncate">
                {user.hospital_name || 'PHC Node'}
              </span>
            </div>
          )}
        </div>
      </nav>

      {/* Slide-out Left Console Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-[#1a1a18]/40 backdrop-blur-2xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 left-0 max-w-full flex">
            <div className="w-screen max-w-xs bg-[#f2efeb] border-r-[1.5px] border-[#1a1a18] shadow-2xl flex flex-col transition-all duration-300 animate-in slide-in-from-left">
              {/* Drawer Header */}
              <div className="p-4 border-b border-[#1a1a18] bg-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-[#1a1a18] text-[#f2efeb] font-syne font-extrabold flex items-center justify-center text-sm shadow-ink">
                    +
                  </div>
                  <div>
                    <h2 className="font-syne font-extrabold text-xs uppercase tracking-tight text-[#1a1a18]">
                      HealthGrid Console
                    </h2>
                    <span className="font-mono text-[10px] text-[#1a1a18]/60 uppercase">Sliding Navigator</span>
                  </div>
                </div>

                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 text-[#1a1a18]/70 hover:text-[#1a1a18] border border-transparent hover:border-[#1a1a18] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Facility Info in Drawer */}
              <div className="p-4 bg-white/70 border-b border-[#1a1a18]/15">
                <div className="font-mono text-[10px] uppercase font-bold text-[#059669] mb-1">
                  Active Health Facility
                </div>
                <div className="font-bold text-xs text-[#1a1a18] truncate">
                  {user?.hospital_name || 'Primary Health Centre'}
                </div>
                <div className="text-[11px] text-[#1a1a18]/60 truncate font-mono">{user?.address}</div>

                {user?.role === 'manager' && (
                  <div className="mt-3 pt-3 border-t border-[#1a1a18]/15">
                    <label htmlFor="drawer-fac-select" className="font-mono text-[10px] uppercase font-bold text-[#1a1a18]/70 block mb-1">
                      Switch Facility Node:
                    </label>
                    <div className="relative">
                      <select
                        id="drawer-fac-select"
                        value={user.facility_id || 2}
                        onChange={(e) => switchFacility(Number(e.target.value))}
                        className="w-full bg-white border border-[#1a1a18] text-[#1a1a18] font-mono text-[11px] py-1.5 px-2 outline-none focus-visible:ring-1 focus-visible:ring-[#1a1a18]"
                      >
                        {phcFacilities.map((f) => (
                          <option key={f.id} value={f.id}>
                            [{f.tier}] {f.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#1a1a18]/50 absolute right-2 top-2 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Items in Drawer */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#1a1a18]/60 font-bold px-2 py-1">
                  Workspace Modules
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectView(item.id);
                        setDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 text-xs font-mono uppercase font-bold text-left transition-colors border ${
                        isActive
                          ? 'bg-white text-[#1a1a18] border-[#1a1a18] shadow-ink'
                          : 'border-transparent text-[#1a1a18]/70 hover:bg-white/60 hover:text-[#1a1a18]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-[#059669] shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#1a1a18]/40">
                        [{item.hotkey}]
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Drawer Footer */}
              <div className="p-3 border-t border-gray-200 dark:border-zinc-800 text-[11px] text-gray-500 bg-white dark:bg-zinc-900">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  National HealthGrid
                </span>
                <span className="block text-[10px] text-gray-400 mt-0.5">
                  Press 1–7 to jump to any module
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
