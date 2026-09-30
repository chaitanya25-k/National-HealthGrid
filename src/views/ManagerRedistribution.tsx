import React, { useState, useEffect } from 'react';
import { RedistributionOrder } from '../types';
import { ArrowRightLeft, Truck, CheckCircle2, ShieldCheck, MapPin, RefreshCw } from 'lucide-react';

export const ManagerRedistribution: React.FC = () => {
  const [orders, setOrders] = useState<RedistributionOrder[]>([]);
  const [dispatchToast, setDispatchToast] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/redistribution/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error('Failed to load redistribution orders:', e);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDispatch = async (orderId: string) => {
    const token = localStorage.getItem('hg_token');
    try {
      const res = await fetch('/api/redistribution/dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ order_id: orderId }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: 'DISPATCHED' } : o))
        );
        setDispatchToast(`Order ${orderId} dispatched to District Medical Transport.`);
        setTimeout(() => setDispatchToast(null), 4000);
      }
    } catch (e) {
      console.error('Failed to dispatch order:', e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast */}
      {dispatchToast && (
        <div
          role="status"
          className="p-3 bg-emerald-50 text-emerald-900 border-[1.5px] border-[#059669] text-xs font-mono font-bold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-[#059669]" />
          <span>{dispatchToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#059669] flex items-center gap-1.5">
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#059669]" />
            <span>District & Sub-District Healthcare Logistics</span>
          </div>
          <h1 className="font-syne font-extrabold text-2xl sm:text-4xl uppercase tracking-tight text-[#1a1a18] mt-1">
            Cross-District Automated Resource Redistribution
          </h1>
          <p className="text-xs sm:text-sm text-[#1a1a18]/65 mt-1 font-normal">
            Algorithmic stock rebalancing pairing high-volume District Hospital warehouses with rural Primary Health Centres facing imminent stock-outs.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="self-start sm:self-center px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-[#1a1a18] bg-white hover:bg-[#f2efeb] border border-[#1a1a18] shadow-ink flex items-center gap-1.5 transition-all focus-visible:ring-2 focus-visible:ring-[#1a1a18]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Orders List on Architectural Cards */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-6 bg-white border-[1.5px] border-[#1a1a18] shadow-ink flex flex-col lg:flex-row lg:items-center justify-between gap-6"
          >
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#1a1a18] bg-[#f2efeb] border border-[#1a1a18]/30 px-2 py-0.5">
                  {order.id}
                </span>
                <span
                  className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 border ${
                    order.status === 'DISPATCHED'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                      : 'bg-amber-100 text-amber-900 border-amber-400'
                  }`}
                >
                  {order.status}
                </span>
                <span className="text-xs text-[#1a1a18]/40">·</span>
                <span className="font-mono text-xs text-[#1a1a18]/70 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#1a1a18]/60" />
                  {order.transit_distance_km} km transit (ETA: {order.eta_hours})
                </span>
              </div>

              {/* Source -> Target */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                <div className="font-bold text-[#1a1a18]">
                  {order.source_facility}{' '}
                  <span className="text-xs text-[#1a1a18]/60 font-mono font-normal">({order.source_district} Dist)</span>
                </div>
                <span className="text-[#1a1a18]/40 font-bold hidden sm:inline">→</span>
                <div className="font-bold text-[#059669]">
                  {order.target_facility}{' '}
                  <span className="text-xs text-[#1a1a18]/60 font-mono font-normal">({order.target_district} Dist)</span>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 font-mono text-xs bg-[#f2efeb] border border-[#1a1a18]/20 text-[#1a1a18]">
                <strong>ALLOCATION:</strong> {order.quantity} of {order.resource}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {order.status === 'RECOMMENDED' ? (
                <button
                  onClick={() => handleDispatch(order.id)}
                  className="px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white bg-[#1a1a18] hover:bg-black shadow-ink flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Authorize & Dispatch</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-[#059669] bg-emerald-50 px-3 py-1.5 border border-[#059669]">
                  <Truck className="w-4 h-4 animate-bounce" />
                  <span>En Route to Destination</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Protocol Note */}
      <div className="p-5 bg-white border-[1.5px] border-[#1a1a18] shadow-ink text-xs text-[#1a1a18]/70 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
        <div>
          <h3 className="font-syne font-extrabold uppercase tracking-tight text-[#1a1a18] text-sm">
            Government Supply Chain Protocol
          </h3>
          <p className="mt-1 leading-relaxed font-sans">
            All inter-district stock transfers conform to the State Health Systems Resource Centre (SHSRC) drug movement protocols. Real-time GPS and temperature cold-chain monitoring are logged for biologicals and anti-snake venom vials.
          </p>
        </div>
      </div>
    </div>
  );
};
