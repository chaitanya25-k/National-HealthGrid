import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { AIPredictionResponse } from '../types';
import {
  Sparkles,
  AlertTriangle,
  ArrowRightLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Play,
  RotateCw,
} from 'lucide-react';

export const ManagerAI: React.FC = () => {
  const { user, authenticatedFetch } = useAuth();
  const { simulateAlert } = useNotifications();
  const [horizonDays, setHorizonDays] = useState(7);
  const [prediction, setPrediction] = useState<AIPredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [authorizedAction, setAuthorizedAction] = useState<string | null>(null);

  const runPrediction = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authenticatedFetch('/ai/predict', {
        method: 'POST',
        body: JSON.stringify({
          horizon_days: horizonDays,
          target_facility_id: user?.facility_id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPrediction(data);
      }
    } catch (e) {
      console.error('Failed to run demand prediction:', e);
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch, horizonDays, user?.facility_id]);

  useEffect(() => {
    runPrediction();
  }, [runPrediction]);

  const handleAuthorize = async (actionTitle: string) => {
    setAuthorizedAction(actionTitle);
    try {
      await authenticatedFetch('/api/redistribution/dispatch', {
        method: 'POST',
        body: JSON.stringify({
          source: 'Aundh District Hospital',
          target: user?.hospital_name || 'Junnar Rural PHC',
          resource: 'IV Normal Saline 500ml',
          quantity: '500 bottles',
        }),
      });
    } catch (e) {
      console.error('Error authorizing dispatch:', e);
    }
    setTimeout(() => setAuthorizedAction(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Authorized Toast */}
      {authorizedAction && (
        <div
          role="status"
          className="p-3 bg-emerald-50 text-emerald-900 border-[1.5px] border-[#059669] text-xs font-mono font-bold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-[#059669]" />
          <span>Redistribution order approved and transmitted to District Drug Courier: "{authorizedAction}".</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#059669] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#059669]" />
            <span>Federated Demand Forecasting & Stock-Out Prevention</span>
          </div>
          <h1 className="font-syne font-extrabold text-2xl sm:text-4xl uppercase tracking-tight text-[#1a1a18] mt-1">
            Demand Forecast & Early Warnings
          </h1>
          <p className="text-xs sm:text-sm text-[#1a1a18]/65 mt-1 font-normal">
            Predictive stock-out analysis using local clinical run-rates calibrated against state-wide federated outbreak coefficients.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#f2efeb] p-1 border border-[#1a1a18]/20 text-xs">
            {[3, 7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setHorizonDays(d)}
                className={`px-3 py-1.5 font-mono text-xs font-bold uppercase transition-all ${
                  horizonDays === d
                    ? 'bg-white text-[#1a1a18] border border-[#1a1a18] shadow-ink'
                    : 'text-[#1a1a18]/60 hover:text-[#1a1a18]'
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>

          <button
            onClick={runPrediction}
            disabled={loading}
            className="px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white bg-[#1a1a18] hover:bg-black disabled:opacity-50 flex items-center gap-2 shadow-ink transition-all cursor-pointer"
          >
            {loading ? (
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{loading ? 'Evaluating...' : 'Run Prediction'}</span>
          </button>
        </div>
      </div>

      {/* Model Spec Card on Architectural Card */}
      <div className="p-5 bg-white border-[1.5px] border-[#1a1a18] shadow-ink flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1a1a18] text-[#f2efeb] flex items-center justify-center font-syne font-extrabold text-lg shadow-ink">
            AI
          </div>
          <div>
            <div className="font-syne font-extrabold text-sm uppercase tracking-tight text-[#1a1a18]">
              {prediction?.model || 'Federated PHC Demand Engine v6.5'}
            </div>
            <div className="font-mono text-xs text-[#1a1a18]/65 mt-0.5">
              Node: <span className="font-bold text-[#1a1a18]">{prediction?.facility_name}</span> · District:{' '}
              <span className="font-bold text-[#1a1a18]">{prediction?.district}</span> · Confidence Score:{' '}
              <span className="font-bold text-[#059669]">
                {Math.round((prediction?.confidence_score || 0.94) * 100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#1a1a18]/60 uppercase">
          <Clock className="w-3.5 h-3.5" />
          <span>Last Evaluation: {prediction?.generated_at ? new Date(prediction.generated_at).toLocaleTimeString() : 'Just now'}</span>
        </div>
      </div>

      {/* Risk Hotspots Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-syne font-extrabold text-base uppercase tracking-tight text-[#1a1a18] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Forecasted Depletion Risks & Buffer Shortfalls ({prediction?.risks.length || 0})</span>
          </h2>

          <button
            onClick={() =>
              simulateAlert({
                resource: 'IV Normal Saline',
                severity: 'CRITICAL',
                title: 'Outbreak Surge: Rapid IV Buffer Exhaustion',
                message: '3 rural village sub-centres reported acute gastro cases. 95 bottles consumed in 6 hours.',
              })
            }
            className="font-mono text-xs text-amber-800 uppercase hover:underline font-bold"
          >
            + Trigger Drill Surge
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prediction?.risks.map((risk, idx) => (
            <div
              key={idx}
              className={`p-5 border-[1.5px] shadow-ink transition-all ${
                risk.risk === 'CRITICAL'
                  ? 'bg-[#f2efeb] border-red-600'
                  : risk.risk === 'HIGH'
                  ? 'bg-[#f2efeb] border-amber-600'
                  : 'bg-white border-[#1a1a18]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-syne font-bold text-sm uppercase tracking-tight text-[#1a1a18]">
                  {risk.resource}
                </span>
                <span
                  className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 border ${
                    risk.risk === 'CRITICAL'
                      ? 'bg-red-100 text-red-900 border-red-400'
                      : risk.risk === 'HIGH'
                      ? 'bg-amber-100 text-amber-900 border-amber-400'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-400'
                  }`}
                >
                  {risk.risk}
                </span>
              </div>

              <p className="text-xs text-[#1a1a18]/75 leading-relaxed font-sans">
                {risk.reason}
              </p>

              <div className="mt-4 pt-3 border-t border-[#1a1a18]/15 flex items-center justify-between text-[11px] font-mono">
                {risk.days_remaining !== undefined && (
                  <span className="text-[#1a1a18]/70">
                    Depletion Horizon:{' '}
                    <strong className="text-red-700">
                      {risk.days_remaining} days
                    </strong>
                  </span>
                )}
                {risk.current_stock !== undefined && (
                  <span className="text-[#1a1a18]/60">
                    Current stock: {risk.current_stock}
                  </span>
                )}
                {risk.current_occupancy && (
                  <span className="text-[#1a1a18]/60">
                    Occupancy: {risk.current_occupancy}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-District Automated Redistribution Recommendations */}
      <div className="p-6 bg-white border-[1.5px] border-[#1a1a18] shadow-ink">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1a1a18]/15 gap-2">
          <div>
            <h2 className="font-syne font-extrabold text-base uppercase tracking-tight text-[#1a1a18] flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-[#059669]" />
              <span>Automated Cross-District Redistribution Recommendations</span>
            </h2>
            <p className="text-xs text-[#1a1a18]/65 mt-0.5">
              Algorithmic pairing based on geographic transit distance, district warehouse surplus, and clinical urgency.
            </p>
          </div>
          <span className="font-mono text-xs font-bold text-[#059669] uppercase flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            <span>MO Authorization Required</span>
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {prediction?.recommendations.map((rec, i) => (
            <div
              key={i}
              className="p-4 bg-[#f2efeb] border-[1.5px] border-[#1a1a18] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-syne font-bold text-xs uppercase tracking-tight text-[#1a1a18]">
                    {rec.title}
                  </span>
                  <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 bg-white border border-[#1a1a18] text-[#1a1a18]">
                    {rec.priority}
                  </span>
                </div>
                <p className="text-xs text-[#1a1a18]/70 mt-1 max-w-2xl leading-relaxed">
                  {rec.detail}
                </p>
                {rec.transit_eta && (
                  <div className="font-mono text-[11px] text-[#1a1a18]/60 mt-1 uppercase">
                    Route Transit ETA: <strong className="text-[#1a1a18]">{rec.transit_eta}</strong>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleAuthorize(rec.title)}
                className="self-start sm:self-center px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white bg-[#1a1a18] hover:bg-black shadow-ink whitespace-nowrap transition-colors cursor-pointer"
              >
                {rec.action_button || 'Authorize Transfer'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
