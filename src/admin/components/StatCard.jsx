import React from "react";
import { HiArrowTrendingUp, HiArrowTrendingDown } from "react-icons/hi2";

const StatCard = ({ title, value, icon, trend, trendUp = true, iconColor = "#F97316" }) => {
  return (
    <div className="bg-[#1a1a1a] border border-[#F97316]/10 rounded-xl p-3 sm:p-4 lg:p-5 relative overflow-hidden group hover:border-[#F97316]/30 transition-all">
      <div className="flex justify-between items-start mb-2 gap-2">
        <div className="space-y-0.5 min-w-0">
          <p className="text-white/40 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest truncate">{title}</p>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-display font-bold text-white">{value}</h3>
        </div>
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 shrink-0 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
          style={{ backgroundColor: `${iconColor}1a`, color: iconColor }}
        >
          {icon}
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-1 mt-1">
          <div className={`flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded ${trendUp ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
            {trendUp ? <HiArrowTrendingUp size={9} /> : <HiArrowTrendingDown size={9} />}
            {trend}
          </div>
          <span className="text-[9px] text-white/20 font-bold uppercase tracking-tighter hidden sm:inline">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
