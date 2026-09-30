import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Pill,
  Bed,
  Users,
  Sparkles,
  ArrowRightLeft,
  Share2,
  Building2,
  X,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onSelectView: (viewId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpen,
  onClose,
}) => {
  const { user, switchFacility } = useAuth();

  const managerNav = [
    { id: 'command', label: 'Facility Command Center', icon: LayoutDashboard, shortcut: '1' },
    { id: 'inventory', label: 'Essential Medicines (NLEM)', icon: Pill, shortcut: '2' },
    { id: 'capacity', label: 'Beds & Triage Census', icon: Bed, shortcut: '3' },
    { id: 'personnel', label: 'Medical Staff & ANM Shifts', icon: Users, shortcut: '4' },
    { id: 'forecast', label: 'Demand Forecast & Warnings', icon: Sparkles, shortcut: '5' },
    { id: 'redistribution', label: 'Cross-District Transfers', icon: ArrowRightLeft, shortcut: '6' },
    { id: 'federated', label: 'Federated State Models', icon: Share2, shortcut: '7' },
  ];

  const viewerNav = [
    { id: 'national-overview', label: 'National Situation Monitor', icon: LayoutDashboard, shortcut: '1' },
    { id: 'critical-alerts', label: 'Critical Early Warnings', icon: AlertTriangle, shortcut: '2' },
    { id: 'stock-snapshot', label: 'Statewide Medicine Balance', icon: Pill, shortcut: '3' },
    { id: 'federated', label: 'Federated Model Consensus', icon: Share2, shortcut: '4' },
    { id: 'redistribution', label: 'Active Redistribution Orders', icon: ArrowRightLeft, shortcut: '5' },
  ];

  const navItems = user?.role === 'viewer' ? viewerNav : managerNav;

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
      {/* Drawer backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-40 transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        id="sidebar-navigation"
        aria-label="Main Navigation Menu"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#f2efeb] text-[#1a1a18] flex flex-col border-r-[1.5px] border-[#1a1a18] transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Active Facility Card */}
        <div className="p-4 border-b border-[#1a1a18] bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#059669]">
              Active Facility
            </span>
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="text-[#1a1a18]/60 hover:text-[#1a1a18] p-1 border border-transparent hover:border-[#1a1a18] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-[#f2efeb] p-3 border border-[#1a1a18]/20">
            <div className="flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <h2 className="text-xs font-bold text-[#1a1a18] truncate">
                  {user?.role === 'manager'
                    ? user.hospital_name || 'Health Facility'
                    : 'National Health Network'}
                </h2>
                <p className="text-[11px] text-[#1a1a18]/60 truncate mt-0.5 font-mono">
                  {user?.role === 'manager'
                    ? user.address || 'Facility operations'
                    : 'MoHFW Central Monitoring Desk'}
                </p>
              </div>
            </div>

            {/* Quick Facility Switcher for Demonstration */}
            {user?.role === 'manager' && (
              <div className="mt-2.5 pt-2 border-t border-[#1a1a18]/15">
                <label htmlFor="facility-select" className="sr-only">
                  Switch Active Facility
                </label>
                <div className="relative">
                  <select
                    id="facility-select"
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
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5" role="navigation" aria-label="Modules Navigation">
          <div className="px-3 py-1 text-[10px] font-mono font-bold text-[#1a1a18]/60 uppercase tracking-wider">
            Clinical Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectView(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono uppercase font-bold text-left transition-colors border ${
                  isActive
                    ? 'bg-white text-[#1a1a18] border-[#1a1a18] shadow-ink'
                    : 'border-transparent text-[#1a1a18]/70 hover:bg-white/60 hover:text-[#1a1a18]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#059669]' : 'text-[#1a1a18]/50'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-[#1a1a18]/60 bg-white border border-[#1a1a18]/20">
                  {item.shortcut}
                </kbd>
              </button>
            );
          })}
        </nav>

        {/* System Footer */}
        <div className="p-4 border-t border-[#1a1a18] bg-white font-mono text-xs">
          <div className="flex items-center justify-between text-[#1a1a18]/70">
            <span>Federated Network</span>
            <span className="text-[10px] text-[#059669] font-bold">
              ● ONLINE
            </span>
          </div>
          <div className="mt-1 text-[11px] text-[#1a1a18]/50">
            Node: IN-MH-PHC-02
          </div>
        </div>
      </aside>
    </>
  );
};
