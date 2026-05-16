import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineShoppingBag, HiOutlineArrowRight, HiOutlineClock,
  HiOutlineStar, HiOutlineBanknotes, HiOutlineBell, HiOutlineArrowPath
} from 'react-icons/hi2';
import { useCustomer } from '../CustomerContext';
import OrderStatusBadge from '../components/OrderStatusBadge';
import api from '../../api/axios';

const StatCard = ({ title, value, icon: Icon, trend, trendColor }) => (
  <div className="p-3 sm:p-4 rounded-2xl relative overflow-hidden bg-surface border border-border-subtle">
    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center mb-2 bg-brand-primary/15 text-brand-primary">
      <Icon size={18} aria-hidden="true" />
    </div>
    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] mb-0.5 text-text-muted truncate">{title}</p>
    <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-text-primary tracking-tight">{value}</h3>
    {trend && (
      <p className={`mt-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest ${trendColor} truncate hidden sm:block`}>
        {trend}
      </p>
    )}
  </div>
);

const CustomerDashboard = () => {
  const { customer } = useCustomer();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingCount: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentNotifs, setRecentNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [ordersRes, notifsRes] = await Promise.all([
        api.get('/customers/orders'),
        api.get('/customers/notifications')
      ]);

      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const pendingCount = orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length;

      setStats({
        totalOrders: orders.length,
        totalSpent,
        pendingCount
      });
      setRecentOrders(orders.slice(0, 3));
      
      const notifsData = notifsRes.data;
      const notifsList = Array.isArray(notifsData) ? notifsData : (Array.isArray(notifsData?.notifications) ? notifsData.notifications : []);
      setRecentNotifs(notifsList.slice(0, 3));
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchData(true);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse" aria-busy="true" aria-live="polite">
        <div className="h-48 bg-text-primary/5 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={`stat-skeleton-${i}`} className="h-32 bg-text-primary/5 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 h-96 bg-text-primary/5 rounded-2xl" />
           <div className="h-96 bg-text-primary/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  const firstName = customer?.name?.split(' ')[0] || 'there';
  const points = customer?.loyaltyPoints || 0;
  const pointsToNext = 100 - (points % 100);

  return (
    <div className="space-y-5 sm:space-y-7 pb-8">

      {/* Welcome */}
      <section className="rounded-2xl p-4 sm:p-6 lg:p-8 bg-brand-primary border border-brand-primary/20">
        <p className="text-text-primary/70 text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] mb-1.5">{getTimeGreeting()}</p>
        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-display font-bold tracking-tight text-text-primary mb-2 leading-tight">
          Hello, {firstName}.
        </h1>
        <p className="text-text-primary/80 font-medium mb-4 text-sm sm:text-base md:text-lg">What are you craving today?</p>
        <Link
          to="/portal/order"
          className="inline-flex items-center justify-center gap-2 bg-white text-brand-dark px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm tracking-widest hover:bg-brand-cream transition-colors"
        >
          BROWSE MENU
          <HiOutlineArrowRight aria-hidden="true" />
        </Link>
      </section>

      {/* Stats Grid */}
      <section aria-label="Account summary" className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={HiOutlineShoppingBag}
          trend="lifetime"
          trendColor="text-text-muted"
        />
        <StatCard
          title="Total Spent"
          value={`₵${stats.totalSpent}`}
          icon={HiOutlineBanknotes}
          trend="lifetime"
          trendColor="text-text-muted"
        />
        <StatCard
          title="Loyalty Points"
          value={points}
          icon={HiOutlineStar}
          trend="available to redeem"
          trendColor="text-text-muted"
        />
        <StatCard
          title="Active Orders"
          value={stats.pendingCount}
          icon={HiOutlineClock}
          trend={stats.pendingCount > 0 ? 'tracking live' : 'no active orders'}
          trendColor={stats.pendingCount > 0 ? 'text-brand-primary' : 'text-text-muted'}
        />
      </section>

      {/* Loyalty Progress */}
      <section
        className="bg-surface border border-border-subtle rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        aria-label="Loyalty progress"
      >
        <div className="flex flex-col gap-2 max-w-md w-full">
          <div className="flex items-center gap-2 text-text-primary">
            <HiOutlineStar size={18} className="text-brand-primary" aria-hidden="true" />
            <span className="font-display font-bold text-base sm:text-lg tracking-tight">
              {points} Oasis Points
            </span>
          </div>
          <p className="text-text-muted font-medium text-[11px] sm:text-xs">Earn 1 point for every GHC 10 spent.</p>

          <div className="mt-2 w-full bg-text-primary/5 rounded-full h-1.5 overflow-hidden" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={points % 100} aria-label={`${pointsToNext} points until next reward`}>
            <div
              className="bg-brand-primary h-full rounded-full transition-[width]"
              style={{ width: `${Math.min((points % 100), 100)}%` }}
            />
          </div>
          <p className="text-text-muted text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
            {pointsToNext} points until your next reward
          </p>
        </div>

        <Link
          to="/portal/loyalty"
          className="bg-brand-primary text-text-primary px-5 sm:px-7 py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-xs tracking-widest hover:bg-brand-primary/90 transition-colors whitespace-nowrap inline-flex items-center self-stretch sm:self-auto justify-center"
        >
          VIEW HISTORY
        </Link>
      </section>

      {/* Order Again */}
      {recentOrders.length > 0 && (
        <section aria-label="Order again" className="space-y-3">
          <div className="flex justify-between items-end">
            <h2 className="text-base sm:text-lg font-display font-bold tracking-tight text-text-primary">
              Order again
            </h2>
            <Link to="/portal/order" className="text-brand-primary text-[11px] font-bold hover:underline tracking-widest uppercase font-sans inline-flex items-center">Browse →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {recentOrders.slice(0, 3).map(order => (
              <div
                key={order.id}
                className="p-3 rounded-xl border border-border-subtle bg-surface hover:border-brand-primary/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-brand-primary/15 text-brand-primary">
                    <HiOutlineArrowPath size={16} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text-primary text-[12px] truncate">{order.orderNumber}</p>
                    <p className="text-[9px] text-text-muted uppercase font-bold tracking-widest">
                      {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <Link
                  to="/portal/order"
                  className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-brand-primary border border-brand-primary/30 hover:bg-brand-primary hover:text-text-primary transition-colors"
                >
                  Reorder <HiOutlineArrowRight size={12} aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Orders + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-7">

        <section aria-label="Recent orders" className="lg:col-span-2 space-y-3">
          <div className="flex justify-between items-end">
            <h2 className="text-base sm:text-lg font-display font-bold tracking-tight text-text-primary">
              Recent orders
            </h2>
            <Link to="/portal/orders" className="text-brand-primary text-[11px] font-bold hover:underline tracking-widest uppercase font-sans inline-flex items-center">View all</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {recentOrders.length > 0 ? recentOrders.map(order => (
              <Link
                to={`/portal/orders/${order.id}`}
                key={order.id}
                aria-label={`Open order ${order.orderNumber}`}
                className="bg-brand-bg border border-border-subtle p-3 rounded-xl hover:bg-text-primary/[0.03] active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 bg-text-primary/5 rounded-lg flex items-center justify-center text-brand-primary shrink-0">
                    <HiOutlineShoppingBag size={18} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-text-primary text-[13px] truncate">{order.orderNumber}</p>
                    <p className="text-[9px] text-text-muted uppercase font-bold tracking-widest truncate">
                      {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <p className="font-black text-text-primary text-sm shrink-0">₵{order.totalAmount}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </Link>
            )) : (
              <div className="sm:col-span-2 bg-brand-bg border border-border-subtle p-6 rounded-xl text-center">
                 <HiOutlineShoppingBag size={36} className="mx-auto text-text-muted/40 mb-2" aria-hidden="true" />
                 <p className="text-text-muted font-bold mb-3 font-sans text-sm">No orders yet.</p>
                 <Link to="/portal/order" className="text-brand-primary font-bold text-xs hover:underline uppercase tracking-widest font-sans inline-flex items-center">Place your first order</Link>
              </div>
            )}
          </div>
        </section>

        <section aria-label="Notifications" className="space-y-3">
          <div className="flex justify-between items-end">
            <h2 className="text-base sm:text-lg font-display font-bold tracking-tight text-text-primary">
              Notifications
            </h2>
            <Link to="/portal/notifications" className="text-brand-primary text-[11px] font-bold hover:underline tracking-widest uppercase font-sans inline-flex items-center">View all</Link>
          </div>

          <div className="bg-brand-bg border border-border-subtle rounded-2xl overflow-hidden divide-y divide-border-subtle">
             {recentNotifs.length > 0 ? recentNotifs.map(n => (
               <div key={n.id} className="p-3 hover:bg-text-primary/[0.02] transition-colors relative">
                  {!n.read && <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-brand-primary rounded-r-full" aria-hidden="true" />}
                  <div className="flex gap-2.5">
                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${!n.read ? 'bg-brand-primary/20 text-brand-primary' : 'bg-text-primary/5 text-text-muted'}`}>
                        <HiOutlineBell size={14} aria-hidden="true" />
                     </div>
                     <div className="min-w-0">
                        <p className={`text-[12px] font-bold mb-0.5 font-sans truncate ${!n.read ? 'text-text-primary' : 'text-text-muted'}`}>{n.title}</p>
                        <p className="text-[10px] text-text-muted line-clamp-2 leading-relaxed font-sans">{n.message}</p>
                     </div>
                  </div>
               </div>
             )) : (
               <div className="p-6 text-center text-text-muted/40">
                  <HiOutlineBell size={24} className="mx-auto mb-2" aria-hidden="true" />
                  <p className="text-[11px] font-bold uppercase tracking-widest font-sans">No activity</p>
               </div>
             )}
          </div>

          <div className="bg-brand-primary/5 border border-brand-primary/15 p-3 sm:p-4 rounded-2xl">
             <div className="flex items-center gap-2 mb-1.5">
                <HiOutlineStar className="text-brand-primary" size={16} aria-hidden="true" />
                <span className="text-[11px] font-black text-text-primary uppercase tracking-tight font-sans">Need help?</span>
             </div>
             <p className="text-[10px] text-text-muted leading-relaxed mb-2 font-sans">Our support team is available via WhatsApp.</p>
             <a href="https://wa.me/UPDATE_WITH_KO_WHATSAPP" className="text-[10px] font-black text-brand-primary uppercase tracking-[0.18em] hover:underline inline-flex items-center gap-1 font-sans">
                Contact support <HiOutlineArrowRight size={10} aria-hidden="true" />
             </a>
          </div>
        </section>

      </div>
    </div>
  );
};

export default CustomerDashboard;
