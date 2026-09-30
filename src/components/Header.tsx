import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell,
  Sun,
  Moon,
  Keyboard,
  LogOut,
  Menu,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenShortcuts: () => void;
  activeViewTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenShortcuts,
  activeViewTitle,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount, criticalCount, toggleDrawer, simulateAlert } = useNotifications();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#f2efeb] border-b-[1.5px] border-[#1a1a18] transition-colors duration-200">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left Zone: Brand & Mobile Menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 border border-[#1a1a18] bg-white text-[#1a1a18] hover:bg-[#f2efeb] transition-colors focus-visible:ring-2 focus-visible:ring-[#1a1a18]"
          >
            <Menu className="w-5 h-5" />
          </button>

          <a
            href="/"
            className="flex items-center gap-3 focus-visible:ring-2 focus-visible:ring-[#1a1a18] p-1"
          >
            <div className="w-9 h-9 bg-[#1a1a18] text-[#f2efeb] flex items-center justify-center font-syne font-extrabold text-xl shadow-ink">
              +
            </div>
            <div>
              <div className="flex items-baseline gap-1.5 leading-none">
                <span className="font-syne font-extrabold text-base tracking-tight uppercase text-[#1a1a18]">
                  HealthGrid
                </span>
                <span className="font-mono text-[10px] font-bold text-[#059669] uppercase tracking-wider">
                  India
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#1a1a18]/60 hidden sm:block uppercase tracking-wider mt-0.5">
                PHC & Hospital Resource Network
              </span>
            </div>
          </a>

          {/* Breadcrumb */}
          <div className="hidden lg:flex items-center font-mono text-[11px] text-[#1a1a18]/60 gap-2 ml-4 pl-4 border-l border-[#1a1a18]/20 uppercase">
            <span className="truncate max-w-[200px]">
              {user?.role === 'manager'
                ? user.hospital_name || 'Health Facility'
                : 'National Situation Room'}
            </span>
            <span aria-hidden="true">/</span>
            <span className="font-bold text-[#1a1a18]">{activeViewTitle}</span>
          </div>
        </div>

        {/* Right Zone: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Federated Network Pulse Badge */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white border border-[#1a1a18]/20 font-mono text-[11px] uppercase tracking-wider text-[#1a1a18]"
            title="Privacy-Preserving Federated Network (Round 14 Active)"
          >
            <span className="w-2 h-2 bg-[#059669] animate-pulse inline-block" />
            <span>Federated Node Synced</span>
          </div>

          {/* Emergency Drill Simulation Button */}
          <button
            onClick={() =>
              simulateAlert({
                resource: 'IV Normal Saline',
                severity: 'CRITICAL',
                title: 'Outbreak Warning: IV Saline Run-Rate Exhaustion',
                message: 'Diarrheal cluster reported in sub-centre villages. Run-rate projected <24h.',
              })
            }
            aria-label="Simulate emergency alert drill (Alt+S)"
            title="Simulate Emergency Alert Drill (Alt+S)"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#1a1a18] bg-white hover:bg-[#f2efeb] border border-[#1a1a18] shadow-ink transition-all focus-visible:ring-2 focus-visible:ring-[#1a1a18]"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Drill Sim</span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={toggleDrawer}
            aria-label={`Real-time alert center: ${unreadCount} unread. Shortcut: Alt+N.`}
            className="relative p-2 bg-white border border-[#1a1a18]/30 hover:border-[#1a1a18] text-[#1a1a18] transition-colors focus-visible:ring-2 focus-visible:ring-[#1a1a18]"
            title="Alert Center (Alt+N)"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span
                className={`absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 text-[9px] font-mono font-bold flex items-center justify-center text-white ${
                  criticalCount > 0 ? 'bg-red-600 animate-pulse' : 'bg-[#059669]'
                }`}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={`Toggle theme (current: ${theme})`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme (Alt+T)`}
            className="p-2 bg-white border border-[#1a1a18]/30 hover:border-[#1a1a18] text-[#1a1a18] transition-colors focus-visible:ring-2 focus-visible:ring-[#1a1a18]"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Keyboard Shortcuts Trigger */}
          <button
            onClick={onOpenShortcuts}
            aria-label="View keyboard shortcuts (?)"
            title="Keyboard Shortcuts (?)"
            className="hidden sm:flex p-2 bg-white border border-[#1a1a18]/30 hover:border-[#1a1a18] text-[#1a1a18] transition-colors focus-visible:ring-2 focus-visible:ring-[#1a1a18]"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#1a1a18]/20">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-[#1a1a18] truncate max-w-[140px]">
                {user?.hospital_name || user?.email}
              </div>
              <div className="font-mono text-[9px] text-[#1a1a18]/60 uppercase">
                {user?.role === 'manager' ? `${user.facility_tier || 'PHC'} Officer` : 'National Desk'}
              </div>
            </div>

            <button
              onClick={logout}
              aria-label="Sign out"
              title="Sign Out"
              className="p-2 border border-[#1a1a18]/30 hover:border-[#1a1a18] hover:bg-red-50 text-[#1a1a18] hover:text-red-700 transition-colors focus-visible:ring-2 focus-visible:ring-[#1a1a18]"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
