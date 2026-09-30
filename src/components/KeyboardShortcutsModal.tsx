import React, { useEffect, useRef } from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: '1 – 7', description: 'Jump between Command Center, Stocks, Beds, Shifts, Forecast, Transfers, Models' },
    { key: 'Alt + N / N', description: 'Open / close real-time Emergency Alert Notification Drawer' },
    { key: 'Alt + T / T', description: 'Toggle visual theme' },
    { key: 'Alt + S / S', description: 'Trigger simulated emergency alert drill' },
    { key: 'Alt + M / M', description: 'Slide out left facility & tier switcher drawer' },
    { key: '?', description: 'Open this keyboard shortcuts cheat-sheet' },
    { key: 'Esc', description: 'Dismiss modal, slide drawer, or notification toast' },
    { key: 'Tab / Shift+Tab', description: 'Focus navigation across all interactive buttons & fields' },
    { key: 'Enter / Space', description: 'Activate buttons, tabs, or acknowledge alerts' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-white border-[1.5px] border-[#1a1a18] shadow-ink-lg p-6 z-10"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#1a1a18]/15">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1a1a18] text-[#f2efeb] font-syne font-extrabold flex items-center justify-center text-sm shadow-ink">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="shortcuts-title"
                className="font-syne font-extrabold uppercase text-sm tracking-tight text-[#1a1a18]"
              >
                Keyboard Navigation
              </h2>
              <p className="text-xs text-[#1a1a18]/65 mt-0.5 font-normal">
                Full WCAG keyboard support for rapid clinical workflows.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close shortcuts modal (Esc)"
            className="p-1.5 text-[#1a1a18]/60 hover:text-[#1a1a18] border border-transparent hover:border-[#1a1a18] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 bg-[#f2efeb] border border-[#1a1a18]/20"
            >
              <span className="text-xs font-sans text-[#1a1a18]">
                {sc.description}
              </span>
              <kbd className="inline-flex items-center px-2 py-0.5 text-xs font-mono font-bold text-[#1a1a18] bg-white border border-[#1a1a18] shadow-ink shrink-0 ml-3">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-[#1a1a18]/15 flex items-center justify-between text-xs text-[#1a1a18]/65">
          <span className="flex items-center gap-1 font-mono text-[11px] uppercase">
            <Command className="w-3.5 h-3.5 text-[#059669]" /> WCAG 2.1 AA Compliant
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white bg-[#1a1a18] hover:bg-black shadow-ink cursor-pointer transition-colors"
          >
            Dismiss (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
