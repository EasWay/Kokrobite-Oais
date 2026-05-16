import React, { useState, useEffect, useCallback } from "react"
import api from "../../api/axios"
import { useSocket } from "../../hooks/useSocket"
import { 
  HiOutlineTruck, HiOutlineUser, HiOutlineMapPin, 
  HiOutlineClock, HiOutlineSignal, HiOutlineCheckCircle,
  HiOutlinePhone, HiOutlineChatBubbleLeftRight,
  HiOutlineChevronDown
} from "react-icons/hi2"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"
// Removed date-fns import

function formatDistanceToNow(date) {
  if (!date) return "never";
  const diff = Math.floor((new Date() - new Date(date)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function LiveTracking() {
  const [drivers, setDrivers] = useState([])
  const [activeOrders, setActiveOrders] = useState([])
  const [stats, setStats] = useState({ delivering: 0, online: 0, pending: 0, deliveredToday: 0 })
  const [filter, setFilter] = useState("All")
  const [loading, setLoading] = useState(true)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const socket = useSocket()

  const fetchData = useCallback(async () => {
    try {
      const [driversRes, ordersRes, statsRes] = await Promise.all([
        api.get("/admin/drivers"),
        api.get("/admin/customer-orders?status=preparing"),
        api.get("/admin/drivers/stats") // Assuming this exists or returns these metrics
      ])
      setDrivers(driversRes.data)
      setActiveOrders(ordersRes.data)
      
      // Calculate local stats if needed or use statsRes
      const delivering = driversRes.data.filter(d => d.status === 'delivering').length
      const online = driversRes.data.filter(d => d.status === 'online').length
      setStats({
        delivering,
        online,
        pending: ordersRes.data.length,
        deliveredToday: statsRes.data?.deliveredToday || 0
      })
    } catch (err) {
      console.error("Failed to fetch live data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!socket) return

    setIsSocketConnected(socket.connected)

    const handleConnect = () => setIsSocketConnected(true)
    const handleDisconnect = () => setIsSocketConnected(false)
    const handleDriverStatus = (data) => {
      setDrivers(prev => prev.map(d => d.id === data.driverId ? { ...d, status: data.status } : d))
      if (data.status === 'online') toast.success(`${data.name} is now Online`)
      if (data.status === 'offline') toast.error(`${data.name} went Offline`)
      fetchData()
    }
    const handleDriverLocation = (data) => {
      setDrivers(prev => prev.map(d =>
        d.id === data.driverId ? { ...d, currentLat: data.lat, currentLng: data.lng, lastLocationAt: new Date() } : d
      ))
    }
    const handleOrderUpdate = () => fetchData()

    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisconnect)
    socket.on("driver_status_update", handleDriverStatus)
    socket.on("driver_location_update", handleDriverLocation)
    socket.on("order_update", handleOrderUpdate)

    return () => {
      socket.off("connect", handleConnect)
      socket.off("disconnect", handleDisconnect)
      socket.off("driver_status_update", handleDriverStatus)
      socket.off("driver_location_update", handleDriverLocation)
      socket.off("order_update", handleOrderUpdate)
    }
  }, [socket, fetchData])

  // Fallback polling
  useEffect(() => {
    let interval = null
    if (!isSocketConnected) {
      interval = setInterval(fetchData, 30000)
    }
    return () => clearInterval(interval)
  }, [isSocketConnected, fetchData])

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await api.patch(`/admin/customer-orders/${orderId}/status`, { status })
      toast.success("Order status updated")
      fetchData()
    } catch (err) {
      toast.error("Failed to update status")
    }
  }

  const filteredDrivers = drivers.filter(d => {
    if (filter === "All") return true
    return d.status.toLowerCase() === filter.toLowerCase()
  })

  return (
    <div className="space-y-4 sm:space-y-5 pb-8">

      {/* ── HEADER & SOCKET INDICATOR ── */}
      <div className="flex justify-between items-center gap-2">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-display font-bold text-white leading-tight">Fleet Tracker</h1>
          <p className="text-white/40 text-[10px] sm:text-xs hidden sm:block">Live deliveries and rider locations.</p>
        </div>

        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border shrink-0 ${
          isSocketConnected ? 'bg-[#10B981]/10 border-[#10B981]/20' : 'bg-red-500/10 border-red-500/20'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isSocketConnected ? 'bg-[#10B981] animate-pulse' : 'bg-red-500'}`} />
          <span className={`text-[9px] font-bold uppercase tracking-widest ${isSocketConnected ? 'text-[#10B981]' : 'text-red-500'}`}>
            {isSocketConnected ? 'Live' : 'Reconnecting…'}
          </span>
        </div>
      </div>

      {/* ── TOP STATS STRIP ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        <MiniStat label="In Progress" value={stats.delivering} dotColor="bg-[#F97316]" pulse />
        <MiniStat label="Online" value={stats.online} dotColor="bg-[#10B981]" />
        <MiniStat label="Awaiting" value={stats.pending} dotColor="bg-[#F59E0B]" />
        <MiniStat label="Done Today" value={stats.deliveredToday} dotColor="bg-[#10B981]" />
      </div>

      <div className="flex flex-col lg:flex-row gap-3 sm:gap-5 lg:gap-6 min-h-[400px]">

        {/* ── LEFT PANEL: ACTIVE DELIVERIES ── */}
        <div className="w-full lg:w-[40%] space-y-2.5 flex flex-col">
          <div className="flex items-center gap-1.5 px-1">
            <HiOutlineTruck className="text-[#F97316]" size={14} />
            <h2 className="font-bold text-[11px] text-white uppercase tracking-widest">Live Deliveries</h2>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 pr-1">
            {activeOrders.length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-1 flex flex-col items-center justify-center h-40 bg-[#111111] rounded-2xl border border-white/5 space-y-2">
                <HiOutlineTruck size={32} className="text-white/10" />
                <div className="text-center">
                  <p className="font-display text-base text-white">No Active Deliveries</p>
                  <p className="text-[11px] text-white/30">All drivers are currently free</p>
                </div>
              </div>
            ) : (
              activeOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-[#1a1a1a] border border-[#F97316]/15 rounded-xl p-3 hover:border-[#F97316]/35 transition-all cursor-pointer group shadow-md"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[#F97316] text-[10px] font-bold uppercase tracking-widest">#{order.orderNumber}</p>
                    <p className="text-white/30 text-[9px] font-medium">{formatDistanceToNow(new Date(order.createdAt))} ago</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <HiOutlineTruck className="text-[#F97316] shrink-0" size={12} />
                      <div className="min-w-0">
                        <p className="text-white text-[12px] font-semibold truncate">{order.delivery?.driver?.name || 'Unassigned'}</p>
                        <p className="text-[#F97316] text-[9px] font-bold uppercase truncate">
                          {order.status === 'preparing' ? 'Heading to restaurant' : 'On the way to customer'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <HiOutlineUser className="text-white/40 shrink-0" size={12} />
                      <p className="text-white/60 text-[11px] font-medium truncate">{order.customer?.name}</p>
                    </div>

                    <div className="flex items-start gap-2">
                      <HiOutlineMapPin className="text-white/40 shrink-0 mt-0.5" size={12} />
                      <p className="text-white/40 text-[10px] leading-snug line-clamp-2">{order.deliveryAddress}</p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                      <div>
                        <p className="text-white font-bold text-[12px]">GHC {order.totalAmount}</p>
                        <p className="text-white/30 text-[9px]">Earns: GHC 20</p>
                      </div>

                      <div className="relative">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-md pl-2 pr-6 py-1 text-[9px] font-bold text-white uppercase tracking-widest appearance-none outline-none focus:border-[#F97316]"
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          {order.type === 'pickup' && <option value="delivered">Delivered</option>}
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <HiOutlineChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={10} />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: DRIVER FLEET ── */}
        <div className="w-full lg:w-[60%] space-y-2.5">
          <div className="flex justify-between items-center px-1">
            <h2 className="font-bold text-[11px] text-white uppercase tracking-widest">Driver Fleet</h2>
            <div className="flex bg-white/5 p-0.5 rounded-lg">
              {["All", "Online", "Delivering", "Offline"].map(t => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                    filter === t ? 'bg-[#F97316] text-white' : 'text-white/40 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2.5">
            {filteredDrivers.map(driver => (
              <div
                key={driver.id}
                className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-3 space-y-2.5 shadow-md relative overflow-hidden"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F97316] to-[#FB923C] flex items-center justify-center text-white text-sm font-bold shadow shrink-0">
                    {driver.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-bold text-[13px] truncate">{driver.name}</h3>
                    <p className="text-white/40 text-[10px] truncate">{driver.phone}</p>
                  </div>

                  <div className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded shrink-0 ${
                    driver.status === 'online' ? 'bg-[#10B981]/10 text-[#10B981]' :
                    driver.status === 'delivering' ? 'bg-[#F97316]/10 text-[#F97316]' :
                    'bg-white/5 text-white/40'
                  }`}>
                    {driver.status}
                  </div>
                </div>

                {driver.status === 'delivering' && (
                  <div className="p-2 bg-white/[0.02] border border-white/5 rounded-lg">
                    <p className="text-[#F97316] text-[9px] font-bold uppercase">Active</p>
                    <p className="text-white/60 text-[10px] truncate">→ {driver.deliveries?.[0]?.order?.deliveryAddress || 'Heading to customer'}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-1.5 py-2 border-y border-white/5">
                  <DriverMiniStat label="Today" value={`₵${driver.todayEarnings || 0}`} />
                  <DriverMiniStat label="Trips" value={driver.totalDeliveries || 0} />
                  <DriverMiniStat label="Rating" value={`★${driver.rating?.toFixed(1) || '0.0'}`} />
                </div>

                {driver.currentLat && (
                  <p className="text-white/20 text-[9px] uppercase tracking-tighter flex items-center gap-1">
                    <HiOutlineMapPin size={10} />
                    Last seen {formatDistanceToNow(new Date(driver.lastLocationAt))} ago
                  </p>
                )}

                <div className="grid grid-cols-2 gap-1.5">
                  <a
                    href={`tel:${driver.phone}`}
                    className="flex items-center justify-center gap-1.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    <HiOutlinePhone size={12} /> Call
                  </a>
                  <a
                    href={`https://wa.me/${driver.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 rounded-lg text-[#25D366] text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    <HiOutlineChatBubbleLeftRight size={12} /> WA
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}

function MiniStat({ label, value, dotColor, pulse }) {
  return (
    <div className="bg-[#111111] border border-white/5 rounded-xl p-2.5 sm:p-3 flex items-center justify-between shadow-lg">
      <div className="min-w-0">
        <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.18em] truncate">{label}</p>
        <p className="text-base sm:text-lg font-bold text-white leading-none">{value}</p>
      </div>
      <div className={`w-2 h-2 rounded-full shrink-0 ${dotColor} ${pulse ? 'animate-pulse' : ''}`} />
    </div>
  )
}

function DriverMiniStat({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-[9px] font-bold text-white/20 uppercase tracking-tighter mb-0.5">{label}</p>
      <p className="text-xs font-bold text-white">{value}</p>
    </div>
  )
}
