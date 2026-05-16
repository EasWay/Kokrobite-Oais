import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  HiOutlinePlus, HiOutlineMagnifyingGlass, HiOutlineStar, HiStar,
  HiOutlinePencilSquare, HiOutlineTrash, HiOutlineCheckCircle, 
  HiOutlineNoSymbol, HiOutlineCheck
} from "react-icons/hi2";
import api from "../../api/axios";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Skeleton from "../components/Skeleton";
import { useToast } from "../components/Toast";

const ReviewsManager = () => {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [tab, setTab] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [search, setSearch] = useState("");
  
  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    author: "", rating: 5, comment: "", avatar: "", branch: "", approved: false, featured: false
  });
  const [saving, setSaving] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/reviews");
      setReviews(response.data);
    } catch (err) {
      showToast("Failed to fetch reviews", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleToggle = async (id, field) => {
    try {
      const endpoint = field === 'approved' ? 'approve' : 'feature';
      const response = await api.patch(`/reviews/${id}/${endpoint}`);
      setReviews(prev => prev.map(r => r.id === id ? response.data : r));
      showToast(`Review ${field} status updated`);
    } catch (err) {
      showToast("Toggle failed", "error");
    }
  };

  const handleBulkApprove = async () => {
    try {
      await Promise.all(selectedIds.map(id => api.patch(`/reviews/${id}/approve`)));
      showToast(`${selectedIds.length} reviews approved`);
      fetchReviews();
      setSelectedIds([]);
    } catch (err) {
      showToast("Bulk approval failed", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/reviews/${deletingId}`);
      setReviews(prev => prev.filter(r => r.id !== deletingId));
      showToast("Review deleted");
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const matchSearch = r.author.toLowerCase().includes(search.toLowerCase());
      const matchRating = ratingFilter === "All" || r.rating === parseInt(ratingFilter);
      const matchTab = tab === "All" || 
                       (tab === "Approved" ? r.approved : 
                        tab === "Pending" ? !r.approved : 
                        tab === "Featured" ? r.featured : true);
      return matchSearch && matchRating && matchTab;
    });
  }, [reviews, search, ratingFilter, tab]);

  const openModal = (review = null) => {
    if (review) {
      setEditingReview(review);
      setFormData({ ...review });
    } else {
      setEditingReview(null);
      setFormData({ author: "", rating: 5, comment: "", avatar: "", branch: "", approved: false, featured: false });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingReview) {
        await api.put(`/reviews/${editingReview.id}`, formData);
        showToast("Review updated");
      } else {
        await api.post("/reviews", formData);
        showToast("Review created");
      }
      fetchReviews();
      setShowModal(false);
    } catch (err) {
      showToast("Failed to save review", "error");
    } finally {
      setSaving(false);
    }
  };

  const renderStars = (rating, interactive = false) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && setFormData({ ...formData, rating: star })}
          className={`${star <= (interactive ? formData.rating : rating) ? 'text-[#F97316]' : 'text-white/10'} transition-colors`}
        >
          {star <= (interactive ? formData.rating : rating) ? <HiStar size={interactive ? 24 : 16} /> : <HiOutlineStar size={interactive ? 24 : 16} />}
        </button>
      ))}
    </div>
  );

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Bar */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex justify-between items-center gap-2">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-display font-bold text-white">Reviews</h1>
          <button
            onClick={() => openModal()}
            className="bg-[#F97316] hover:bg-[#F97316]/90 text-white px-3 sm:px-4 py-1.5 rounded-lg font-bold text-[11px] sm:text-xs flex items-center gap-1.5 transition-all active:scale-95"
          >
            <HiOutlinePlus size={14} /> Add
          </button>
        </div>

        {/* Rating Summary Card */}
        <div className="bg-gradient-to-br from-[#1C0A00]/80 to-[#F97316]/15 border border-[#F97316]/20 rounded-2xl p-3 sm:p-4 lg:p-5 flex flex-col md:flex-row items-center gap-3 sm:gap-4">
           <div className="text-center md:text-left shrink-0">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white leading-none">{avgRating}</h2>
              <div className="flex justify-center md:justify-start my-1">
                 {renderStars(Math.round(avgRating))}
              </div>
              <p className="text-white/40 text-[10px] sm:text-xs font-sans">Based on reviews</p>
           </div>
           <div className="flex-1 grid grid-cols-5 gap-1.5 w-full">
              {[5,4,3,2,1].map(s => {
                const count = reviews.filter(r => r.rating === s).length;
                const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={s} className="bg-white/5 rounded-lg p-1.5 border border-white/5">
                     <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[9px] font-bold text-white/40">{s}★</span>
                        <span className="text-[10px] font-bold text-white">{count}</span>
                     </div>
                     <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#F97316]" style={{ width: `${percent}%` }} />
                     </div>
                  </div>
                )
              })}
           </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
          <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10 self-stretch sm:self-auto overflow-x-auto no-scrollbar">
             {['All', 'Approved', 'Pending', 'Featured'].map(t => (
               <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-md text-[10px] sm:text-[11px] font-bold transition-all whitespace-nowrap ${tab === t ? 'bg-[#F97316] text-white shadow' : 'text-white/40 hover:text-white'}`}
               >
                 {t}
               </button>
             ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
             <div className="relative flex-1 sm:w-48 lg:w-56">
                <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                <input value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:border-[#F97316] outline-none font-sans" placeholder="Search…" />
             </div>
             <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/60 focus:border-[#F97316] outline-none font-sans">
                <option value="All">All</option>
                {[5,4,3,2,1].map(r => <option key={r} value={r}>{r}★</option>)}
             </select>
          </div>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[#F97316]/10 border border-[#F97316]/20 rounded-xl p-4 flex items-center justify-between">
           <span className="text-sm font-bold text-[#F97316] font-sans">{selectedIds.length} items selected</span>
           <div className="flex gap-4">
              <button onClick={handleBulkApprove} className="text-xs font-bold uppercase tracking-widest text-green-500 hover:underline flex items-center gap-2">
                <HiOutlineCheckCircle size={18} /> Approve ({selectedIds.length})
              </button>
              <button onClick={() => setSelectedIds([])} className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white">Cancel</button>
           </div>
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
           <Skeleton height="140px" count={6} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          <AnimatePresence>
            {filteredReviews.length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-3 bg-[#0C0A09] border border-[#F97316]/10 rounded-2xl p-8 sm:p-12 text-center">
                <HiOutlineStar size={36} className="text-[#F97316] mb-3 mx-auto" />
                <h3 className="text-2xl font-display font-bold text-white mb-2">No Reviews Yet</h3>
                <p className="text-white/40 max-w-sm mx-auto font-sans">Customer reviews for Kokrobite Oasis will appear here</p>
              </div>
            ) : filteredReviews.map((review) => (
              <motion.div
                layout
                key={review.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-[#1a1a1a] border border-[#F97316]/08 rounded-xl p-3 relative group"
              >
                <div className="absolute top-3 left-3 z-10">
                   <input
                    type="checkbox"
                    checked={selectedIds.includes(review.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds([...selectedIds, review.id]);
                      else setSelectedIds(selectedIds.filter(id => id !== review.id));
                    }}
                    className="w-3.5 h-3.5 rounded border-white/10 bg-white/5 accent-[#F97316]"
                   />
                </div>

                <div className="pl-7">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                       <div className="w-8 h-8 rounded-full bg-[#F97316] flex items-center justify-center text-white font-bold text-xs font-sans shrink-0">
                         {review.author.charAt(0)}
                       </div>
                       <div className="min-w-0">
                          <p className="text-[12px] font-bold text-white font-sans truncate">{review.author}</p>
                          <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest font-sans">{new Date(review.createdAt).toLocaleDateString()}</p>
                       </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                       <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded font-sans flex items-center gap-0.5 ${review.approved ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#F59E0B]/15 text-[#F59E0B]'}`}>
                         {review.approved ? '✓' : '⏳'}{review.approved ? 'Pub' : 'Pend'}
                       </span>
                       {review.featured && (
                         <span className="bg-[#F97316]/15 text-[#F97316] text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded font-sans flex items-center gap-0.5">
                           <HiStar size={10} /> Feat
                         </span>
                       )}
                    </div>
                  </div>

                  <div className="mb-2">
                    {renderStars(review.rating)}
                  </div>

                  <p className="text-white/70 font-display italic text-[13px] leading-snug mb-2 line-clamp-3">"{review.comment}"</p>

                  {review.branch && (
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mb-2 font-sans truncate">@{review.branch}</p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                     <div className="flex gap-4">
                        <button 
                          onClick={() => handleToggle(review.id, 'approved')}
                          className={`text-xs font-bold flex items-center gap-1.5 transition-all p-2 rounded-lg font-sans ${review.approved ? 'text-white/20 hover:text-red-400 hover:bg-red-400/10' : 'text-[#10B981] hover:bg-[#10B981]/10'}`}
                        >
                          {review.approved ? <HiOutlineNoSymbol size={16} /> : <HiOutlineCheck size={16} />}
                          {review.approved ? 'Revoke' : 'Approve'}
                        </button>
                        <button 
                          onClick={() => handleToggle(review.id, 'featured')}
                          className={`text-xs font-bold flex items-center gap-1.5 transition-all p-2 rounded-lg font-sans ${review.featured ? 'text-[#F97316] hover:bg-[#F97316]/10' : 'text-white/20 hover:text-[#F97316] hover:bg-[#F97316]/10'}`}
                        >
                          <HiStar size={16} />
                          {review.featured ? 'Featured' : 'Feature'}
                        </button>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => openModal(review)} className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all"><HiOutlinePencilSquare size={18} /></button>
                        <button onClick={() => { setDeletingId(review.id); setShowConfirm(true); }} className="p-2 rounded-lg hover:bg-red-500/10 text-[#EF4444] transition-all"><HiOutlineTrash size={18} /></button>
                     </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingReview ? "Edit Review" : "Add Review"} size="md">
         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1 font-sans">Author Name</label>
               <input required value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-[#F97316] font-sans" />
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1 font-sans">Rating</label>
               <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  {renderStars(0, true)}
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1 font-sans">Comment</label>
               <textarea required rows={4} value={formData.comment} onChange={e => setFormData({ ...formData, comment: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none resize-none focus:border-[#F97316] font-display italic text-lg" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                 <span className="text-[10px] font-bold text-white/40 uppercase font-sans">Approved</span>
                 <button type="button" onClick={() => setFormData({ ...formData, approved: !formData.approved })} className={`w-10 h-5 rounded-full relative transition-all ${formData.approved ? 'bg-green-500' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.approved ? 'right-1' : 'left-1'}`} />
                 </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                 <span className="text-[10px] font-bold text-white/40 uppercase">Featured</span>
                 <button type="button" onClick={() => setFormData({ ...formData, featured: !formData.featured })} className={`w-10 h-5 rounded-full relative transition-all ${formData.featured ? 'bg-yellow-500' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.featured ? 'right-1' : 'left-1'}`} />
                 </button>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 font-bold py-4 rounded-2xl">Cancel</button>
              <button disabled={saving} type="submit" className="flex-1 bg-[#F97316] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2">
                {saving ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : "Save Review"}
              </button>
            </div>
         </form>
      </Modal>

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDelete} title="Delete Review" message="Are you sure you want to delete this customer review? This cannot be undone." danger={true} />
    </div>
  );
};

export default ReviewsManager;
