import { HiStar } from 'react-icons/hi2';
import { Palmtree } from 'lucide-react';

const LoyaltyBadge = ({ points, className = "" }) => {
  return (
    <div className={`flex items-center gap-1.5 bg-[#F97316]/15 text-[#F97316] px-3 py-1.5 rounded-full border border-[#F97316]/20 shadow-sm ${className}`}>
      <Palmtree size={14} />
      <span className="font-bold text-xs uppercase tracking-tight font-sans">{points} Oasis Points</span>
    </div>
  );
};

export default LoyaltyBadge;
