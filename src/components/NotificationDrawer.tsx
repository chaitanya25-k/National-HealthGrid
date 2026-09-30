import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../context/NotificationContext';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Clock,
  Radio,
  Zap,
  Filter,
} from 'lucide-react';
import { AlertSeverity } from '../types';

export const NotificationDrawer: React.FC = () => {
  const {
    notifications,
    isOpen,
    setIsOpen,
    acknowledgeAlert,
    refreshNotifications,
    simulateAlert,
    connectionStatus,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'all' | 'unack' | 'critical'>('all');
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (activeTab === 'unack') return !n.acknowledged;
    if (activeTab === 'critical') return n.severity === 'CRITICAL' || n.severity === 'HIGH';
    return true;
  });

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] font-bold bg-red-50 text-red-700 border border-red-600 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-red-600 animate-ping inline-block" />
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2 py-0.5 font-mono text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-600 uppercase tracking-wider">
            HIGH
          </span>
        );
      case 'WATCH':
        return (
          <span className="inline-flex items-center px-2 py-0.5 font-mono text-[10px] font-bold bg-[#059669]/10 text-[#059669] border border-[#059669] uppercase tracking-wider">
            WATCH
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 font-mono text-[10px] font-bold bg-white text-[#1a1a18] border border-[#1a1a18]/40 uppercase tracking-wider">
            ADVISORY
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-drawer-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1a1a18]/40 backdrop-blur-2xs transition-opacity"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          ref={drawerRef}
          className="w-screen max-w-md bg-[#f2efeb] border-l-[1.5px] border-[#1a1a18] shadow-2xl flex flex-col transition-all duration-300"
        >
          {/* Header */}
          <div className="p-4 border-b border-[#1a1a18] bg-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#1a1a18] text-[#f2efeb] font-syne font-extrabold flex items-center justify-center text-sm shadow-ink">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2
                  id="alert-drawer-title"
                  className="font-syne font-extrabold uppercase text-xs tracking-tight text-[#1a1a18]"
                >
                  Clinical Alert Center
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Radio className={`w-3 h-3 ${connectionStatus === 'connected' ? 'text-[#059669] animate-pulse' : 'text-[#1a1a18]/40'}`} />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#1a1a18]/60">
                    {connectionStatus === 'connected' ? 'SSE Live Stream Active' : 'Connecting...'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close notification drawer (Esc)"
              className="p-1.5 text-[#1a1a18]/60 hover:text-[#1a1a18] border border-transparent hover:border-[#1a1a18] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Simulation Bar */}
          <div className="px-4 py-3 bg-white/70 border-b border-[#1a1a18]/15">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase font-bold tracking-wider text-[#1a1a18]/70 mb-2">
              <span className="flex items-center gap-1 text-[#059669]">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Live Drill Simulators:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() =>
                  simulateAlert({
                    resource: 'IV Fluids',
                    severity: 'CRITICAL',
                    title: 'IV Fluids: Acute Shortage Projected',
                    message: 'Burn rate peaked at 210 units/day. Depletion anticipated in <18 hours.',
                  })
                }
                className="px-2 py-1 font-mono text-[10px] uppercase font-bold bg-white text-[#1a1a18] border border-[#1a1a18] shadow-ink hover:bg-[#f2efeb] transition-colors"
              >
                + IV Shortage
              </button>
              <button
                onClick={() =>
                  simulateAlert({
                    resource: 'Oxygen',
                    severity: 'HIGH',
                    title: 'Oxygen Manifold Pressure Drop',
                    message: 'Main cylinder bank pressure reduced by 22% during peak ward delivery.',
                  })
                }
                className="px-2 py-1 font-mono text-[10px] uppercase font-bold bg-white text-[#1a1a18] border border-[#1a1a18] shadow-ink hover:bg-[#f2efeb] transition-colors"
              >
                + Oxygen Surge
              </button>
              <button
                onClick={() =>
                  simulateAlert({
                    resource: 'Beds',
                    severity: 'HIGH',
                    title: 'Mass Casualty Inflow Alert',
                    message: 'District ambulance control routed 8 trauma patients. Emergency bed freeze.',
                  })
                }
                className="px-2 py-1 font-mono text-[10px] uppercase font-bold bg-white text-[#1a1a18] border border-[#1a1a18] shadow-ink hover:bg-[#f2efeb] transition-colors"
              >
                + Bed Surge
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-4 py-2 border-b border-[#1a1a18]/15 bg-white flex items-center justify-between">
            <div className="flex items-center gap-1 bg-[#f2efeb] p-0.5 border border-[#1a1a18]/15 font-mono text-xs font-bold uppercase">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 transition-colors ${
                  activeTab === 'all'
                    ? 'bg-white text-[#1a1a18] border border-[#1a1a18] shadow-ink font-bold'
                    : 'text-[#1a1a18]/60 hover:text-[#1a1a18]'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('unack')}
                className={`px-3 py-1 transition-colors ${
                  activeTab === 'unack'
                    ? 'bg-white text-[#1a1a18] border border-[#1a1a18] shadow-ink font-bold'
                    : 'text-[#1a1a18]/60 hover:text-[#1a1a18]'
                }`}
              >
                Pending ({notifications.filter((n) => !n.acknowledged).length})
              </button>
              <button
                onClick={() => setActiveTab('critical')}
                className={`px-3 py-1 transition-colors ${
                  activeTab === 'critical'
                    ? 'bg-white text-[#1a1a18] border border-[#1a1a18] shadow-ink font-bold'
                    : 'text-[#1a1a18]/60 hover:text-[#1a1a18]'
                }`}
              >
                Critical
              </button>
            </div>

            <button
              onClick={refreshNotifications}
              className="font-mono text-xs text-[#1a1a18]/60 hover:text-[#1a1a18] p-1"
              title="Refresh Alert List"
            >
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alert List on Architectural White Cards */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-dot-grid">
            {filtered.length === 0 ? (
              <div className="text-center py-12 px-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3 opacity-80" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                  No active alerts
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  All clinical alerts in this filter view have been acknowledged or resolved.
                </p>
              </div>
            ) : (
              filtered.map((alert, index) => (
                <div
                  key={`${alert.id}-${index}`}
                  className={`p-3.5 rounded-xl border transition-all ${
                    alert.acknowledged
                      ? 'bg-gray-50 dark:bg-zinc-950/40 border-gray-200 dark:border-zinc-800 opacity-75'
                      : alert.severity === 'CRITICAL'
                      ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                      : 'bg-white dark:bg-zinc-800/80 border-gray-200 dark:border-zinc-700 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(alert.severity)}
                      <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                        {alert.resource}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-gray-900 dark:text-zinc-100 leading-snug">
                    {alert.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                    {alert.message}
                  </p>

                  <div className="mt-2 text-[11px] bg-white dark:bg-zinc-900/60 p-2 rounded-lg text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-zinc-800 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-semibold">Action:</strong> {alert.action_needed}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-700/50">
                    <span className="text-[10px] text-gray-400 truncate max-w-[180px]">
                      {alert.facility_name}
                    </span>

                    {!alert.acknowledged ? (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 rounded-md transition-colors focus-visible:ring-1 focus-visible:ring-emerald-500"
                      >
                        Acknowledge
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Acknowledged
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
