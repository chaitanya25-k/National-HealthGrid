import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SlidingUpperNavbar } from './components/SlidingUpperNavbar';
import { NotificationDrawer } from './components/NotificationDrawer';
import { NotificationToast } from './components/NotificationToast';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { AuthView } from './views/AuthView';
import { ManagerCommandCenter } from './views/ManagerCommandCenter';
import { ManagerInventory } from './views/ManagerInventory';
import { ManagerCapacity } from './views/ManagerCapacity';
import { ManagerPersonnel } from './views/ManagerPersonnel';
import { ManagerAI } from './views/ManagerAI';
import { ManagerRedistribution } from './views/ManagerRedistribution';
import { FederatedModelsView } from './views/FederatedModelsView';
import { ViewerCommandCenter } from './views/ViewerCommandCenter';

function MainApp() {
  const { user, loading } = useAuth();
  const { toggleTheme } = useTheme();
  const { toggleDrawer, simulateAlert } = useNotifications();

  const [currentView, setCurrentView] = useState('command');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Sync default view when user logs in
  useEffect(() => {
    if (user?.role === 'viewer') {
      setCurrentView('national-overview');
    } else {
      setCurrentView('command');
    }
  }, [user?.role]);

  // Global Keyboard Navigation Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
      }

      if (e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        toggleDrawer();
      }

      if ((e.altKey && (e.key === 't' || e.key === 'T')) || e.key === 't' || e.key === 'T') {
        e.preventDefault();
        toggleTheme();
      }

      if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        simulateAlert();
      }

      if (e.altKey && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }

      if (user?.role === 'manager') {
        const viewMap: Record<string, string> = {
          '1': 'command',
          '2': 'inventory',
          '3': 'capacity',
          '4': 'personnel',
          '5': 'forecast',
          '6': 'redistribution',
          '7': 'federated',
        };
        if (viewMap[e.key]) {
          setCurrentView(viewMap[e.key]);
        }
      } else if (user?.role === 'viewer') {
        const viewMap: Record<string, string> = {
          '1': 'national-overview',
          '2': 'critical-alerts',
          '3': 'stock-snapshot',
          '4': 'federated',
          '5': 'redistribution',
        };
        if (viewMap[e.key]) {
          setCurrentView(viewMap[e.key]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user?.role, toggleDrawer, toggleTheme, simulateAlert]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-bold text-xl flex items-center justify-center animate-pulse">
            +
          </div>
          <div className="text-xs font-semibold text-gray-500 font-mono tracking-wider">
            SYNCHRONIZING HEALTHGRID INDIA...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  const getViewTitle = () => {
    switch (currentView) {
      case 'command':
        return 'Facility Command Center';
      case 'inventory':
        return 'Essential Medicines (NLEM)';
      case 'capacity':
        return 'Beds & Triage Census';
      case 'personnel':
        return 'Medical Staff & ANM Shifts';
      case 'forecast':
        return 'Demand Forecast & Warnings';
      case 'redistribution':
        return 'Cross-District Transfers';
      case 'federated':
        return 'Federated State Models';
      case 'national-overview':
        return 'National Situation Monitor';
      case 'critical-alerts':
        return 'Critical Early Warnings';
      case 'stock-snapshot':
        return 'Statewide Medicine Balance';
      default:
        return 'Facility Command Center';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] font-sans flex flex-col transition-colors duration-200 selection:bg-[#059669] selection:text-white">
      {/* Skip to Main Content Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#1a1a18] focus:text-white focus:font-mono focus:text-xs focus:shadow-ink focus:outline-none"
      >
        Skip to main content (Alt+C)
      </a>

      {/* Main Top Header */}
      <Header
        activeViewTitle={getViewTitle()}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
      />

      {/* Innovative Sliding Upper Navigation Bar with Left Slide Trigger Key */}
      <SlidingUpperNavbar
        currentView={currentView}
        onSelectView={(v) => setCurrentView(v)}
      />

      {/* Slide-out Left Drawer Panel */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => setCurrentView(v)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Primary Main Content Viewport with Variation 2 Architectural Canvas */}
      <div className="flex-1 w-full flex flex-col bg-[var(--bg)] bg-dot-grid">
        <main
          id="main-content"
          tabIndex={-1}
          className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-8rem)] outline-none overflow-x-hidden"
          role="main"
          aria-label={getViewTitle()}
        >
          {user.role === 'viewer' ? (
            <>
              {currentView === 'federated' ? (
                <FederatedModelsView />
              ) : currentView === 'redistribution' ? (
                <ManagerRedistribution />
              ) : (
                <ViewerCommandCenter currentTab={currentView} />
              )}
            </>
          ) : (
            <>
              {currentView === 'command' && (
                <ManagerCommandCenter onNavigateTab={(v) => setCurrentView(v)} />
              )}
              {currentView === 'inventory' && <ManagerInventory />}
              {currentView === 'capacity' && <ManagerCapacity />}
              {currentView === 'personnel' && <ManagerPersonnel />}
              {currentView === 'forecast' && <ManagerAI />}
              {currentView === 'redistribution' && <ManagerRedistribution />}
              {currentView === 'federated' && <FederatedModelsView />}
            </>
          )}
        </main>
      </div>

      {/* Real-time Notification Slide-over Drawer */}
      <NotificationDrawer />

      {/* Floating Notification Toast */}
      <NotificationToast />

      {/* Accessible Keyboard Navigation Modal */}
      <KeyboardShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <MainApp />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
