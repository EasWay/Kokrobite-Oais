import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HiOutlineShoppingBag, HiOutlineArrowRight, HiOutlineMagnifyingGlass,
  HiOutlineFunnel, HiOutlineClock, HiOutlineChevronRight
} from 'react-icons/hi2';
import { Palmtree } from 'lucide-react';
import api from '../../api/axios';
import OrderStatusBadge from '../components/OrderStatusBadge';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await api.get('/customers/orders');
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(o => {
    const matchFilter = filter === 'All' || 
                       (filter === 'Pending' && o.status === 'pending') ||
                       (filter === 'Active' && ['confirmed', 'preparing'].includes(o.status)) ||
                       (filter === 'Delivered' && o.status === 'delivered') ||
                       (filter === 'Cancelled' && o.status === 'cancelled');
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-white/5 rounded-2xl w-full max-w-md" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-white/5 rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-8">

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 sm:gap-4">
        <div className="space-y-2.5 min-w-0">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-display font-bold text-white tracking-tight uppercase">My Orders</h2>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
            {['All', 'Pending', 'Active', 'Delivered', 'Cancelled'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === f ? 'bg-[#F97316] text-white shadow-lg' : 'border border-white/15 text-white/50 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full lg:w-64">
           <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
           <input
              type="text"
              placeholder="Search by order number…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#0C0A09] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs focus:border-[#F97316] outline-none transition-all font-sans"
           />
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order, idx) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.03, 0.15) }}
              onClick={() => navigate(`/portal/orders/${order.id}`)}
              className="bg-[#0C0A09] border border-white/5 p-3 rounded-2xl active:bg-white/[0.03] active:scale-[0.99] transition-all cursor-pointer group relative overflow-hidden"
            >
              {['pending', 'confirmed', 'preparing'].includes(order.status) && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#F97316]/5 rounded-full -mr-8 -mt-8" />
              )}

              <div className="flex items-center gap-2.5 mb-2 relative z-10">
                 <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-[#F97316] shrink-0 group-hover:bg-[#F97316] group-hover:text-white transition-all">
                    <HiOutlineShoppingBag size={20} />
                 </div>
                 <div className="min-w-0 flex-1">
                    <p className="font-black text-sm text-white tracking-tight truncate">{order.orderNumber}</p>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest truncate">
                       {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </p>
                 </div>
                 <HiOutlineChevronRight size={16} className="text-white/20 shrink-0" />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 relative z-10">
                 <p className="font-display text-base text-white">₵{order.totalAmount}</p>
                 <div className="flex items-center gap-1.5">
                    <OrderStatusBadge status={order.status} />
                    <span className={`font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full ${order.type === 'delivery' ? 'bg-blue-500/10 text-blue-400' : 'bg-[#F97316]/10 text-[#F97316]'}`}>
                       {order.type}
                    </span>
                 </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="sm:col-span-2 lg:col-span-3 bg-[#0C0A09] border border-white/5 p-8 sm:p-12 rounded-2xl text-center space-y-3">
              <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mx-auto text-[#F97316]">
                 <Palmtree size={28} />
              </div>
             <div>
                <h3 className="text-base font-display font-bold text-white mb-1">No Orders Yet</h3>
                <p className="text-white/40 text-xs max-w-xs mx-auto font-sans">Your Kokrobite Oasis orders will appear here</p>
             </div>
             <Link to="/portal/order" className="inline-flex bg-[#F97316] text-white font-black px-5 py-2 rounded-xl text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#F97316]/20">
                Place your first order
             </Link>
          </div>
        )}
      </div>

    </div>
  );
};

export default OrderHistory;
