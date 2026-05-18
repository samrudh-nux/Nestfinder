import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, BedDouble, Square, ShieldCheck, Share2, Heart, 
  ChevronLeft, ChevronRight, Calendar, User, Phone, 
  Sparkles, CheckCircle2, Video, Box, Calculator, Percent, Clock, X, Loader2,
  Download, Star, Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../lib/api';
import PropertyMap from '../components/Map';
import { useAuthStore } from '../store/authStore';
import AIChatConcierge from '../components/AIChatConcierge';
import NearbyAmenities from '../components/NearbyAmenities';

function BookVisitModal({ isOpen, onClose, listingId, listingTitle }: any) {
  const { user } = useAuthStore();
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 12:00 PM');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/listings/${listingId}/visits`, { date, timeSlot, message });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-xl rounded-[48px] overflow-hidden shadow-3xl border border-terra-border flex flex-col"
      >
        <div className="p-10 bg-terra-green text-white flex justify-between items-center">
          <div>
            <h3 className="text-3xl font-serif italic">Book Site Visit</h3>
            <p className="text-xs text-white/60 font-bold uppercase tracking-widest mt-1 truncate max-w-[300px]">{listingTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-10 space-y-8">
          {!user ? (
            <div className="py-12 text-center space-y-6">
              <div className="w-20 h-20 bg-terra-sidebar text-terra-text-muted rounded-full flex items-center justify-center mx-auto">
                 <User className="w-10 h-10" />
              </div>
              <div className="space-y-4">
                <h4 className="text-2xl font-serif italic text-terra-text">Authenticating Presence</h4>
                <p className="text-sm text-terra-text-muted">Please sign in to your Nest account to book a site visit and connect with the ecosystem.</p>
                <Link 
                  to="/login" 
                  className="inline-block bg-terra-green text-white px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-terra-green/90 transition-all"
                >
                  Sign In
                </Link>
              </div>
            </div>
          ) : success ? (
            <div className="py-12 text-center space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">
                 <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h4 className="text-3xl font-serif italic text-terra-text">Schedule Requested!</h4>
                <p className="text-sm text-terra-text-muted">The owner will be notified of your request. <br/>Check your dashboard for updates.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-terra-text-muted">Select Date</label>
                <div className="relative">
                  <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-terra-green" />
                  <input 
                    required
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-16 pr-6 py-5 bg-terra-sidebar border border-terra-border rounded-3xl focus:outline-none focus:ring-4 focus:ring-terra-green/10 focus:border-terra-green transition-all font-medium text-terra-text"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-terra-text-muted">Preferred Time Slot</label>
                <div className="relative">
                  <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-terra-green" />
                  <select 
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full pl-16 pr-6 py-5 bg-terra-sidebar border border-terra-border rounded-3xl focus:outline-none focus:ring-4 focus:ring-terra-green/10 focus:border-terra-green transition-all font-medium appearance-none text-terra-text"
                  >
                    <option>10:00 AM - 12:00 PM</option>
                    <option>12:00 PM - 03:00 PM</option>
                    <option>03:00 PM - 06:00 PM</option>
                    <option>06:00 PM - 09:00 PM</option>
                  </select>
                  <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-terra-text-muted rotate-90" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-terra-text-muted">Personal Message (Optional)</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell the owner a bit about yourself or why you're interested..."
                  className="w-full p-6 bg-terra-sidebar border border-terra-border rounded-3xl focus:outline-none focus:ring-4 focus:ring-terra-green/10 focus:border-terra-green transition-all font-medium min-h-[120px] text-terra-text resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-terra-green text-white rounded-3xl font-bold uppercase tracking-[0.2em] shadow-xl shadow-terra-green/40 hover:bg-terra-green/90 transition-all flex items-center justify-center space-x-3 active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span>Confirm Schedule</span>}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function PropertyDetails() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showSpecs, setShowSpecs] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Carousel variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 1.05
    })
  };

  const paginate = (newDirection: number) => {
    const nextIdx = (activePhoto + newDirection + photos.length) % photos.length;
    setDirection(newDirection);
    setActivePhoto(nextIdx);
  };

  // Mortgage Calculator State
  const [downPayment, setDownPayment] = useState(0);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTerm, setLoanTerm] = useState(20);
  const [emi, setEmi] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await api.get(`/listings/${id}`);
        setListing(res.data);
        if (res.data.type === 'BUY') {
          setDownPayment(res.data.price * 0.2);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (listing && listing.type === 'BUY') {
      const principal = listing.price - downPayment;
      const r = interestRate / 12 / 100;
      const n = loanTerm * 12;
      const monthlyPmt = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      setEmi(isNaN(monthlyPmt) ? 0 : monthlyPmt);
    }
  }, [listing, downPayment, interestRate, loanTerm]);

  const handleVerify = async () => {
    try {
      const res = await api.put(`/listings/${id}/verify`);
      setListing(res.data);
    } catch (e) {
      console.error(e);
    }
  };
  
  const handleDownloadBlueprint = () => {
    const url = listing.floorPlanUrl || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000";
    const link = document.createElement('a');
    link.href = url;
    link.download = `${listing.title.replace(/\s+/g, '_')}_Blueprint.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !listing) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const photos = JSON.parse(listing.photos || '[]');
  const amenities = JSON.parse(listing.amenities || '[]');

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div className="bg-terra-bg min-h-screen pb-32">
      {/* Photo Gallery Wrap */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="flex justify-between items-center">
          <Link to="/search" className="flex items-center space-x-3 text-terra-text-muted font-bold hover:text-terra-green transition-colors group">
            <div className="w-10 h-10 border border-terra-border rounded-full flex items-center justify-center group-hover:bg-terra-sidebar">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="uppercase tracking-widest text-[10px]">Return to Ecology</span>
          </Link>
          <div className="flex items-center space-x-4">
            <button className="w-12 h-12 border border-terra-border rounded-full hover:bg-terra-sidebar transition-colors text-terra-text flex items-center justify-center"><Share2 className="w-5 h-5" /></button>
            <button className="w-12 h-12 border border-terra-border rounded-full hover:bg-terra-sidebar transition-colors text-terra-text flex items-center justify-center"><Heart className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Carousel Gallery */}
        <div className="space-y-6">
          <div className="relative h-[400px] md:h-[700px] rounded-[56px] overflow-hidden shadow-2xl bg-terra-sidebar group">
            <AnimatePresence initial={false} custom={direction}>
              <motion.img
                key={activePhoto}
                src={photos[activePhoto] || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be'}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                  scale: { duration: 0.4 }
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(_, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x;
                  if (swipe < -10000) paginate(1);
                  else if (swipe > 10000) paginate(-1);
                }}
                className="absolute w-full h-full object-cover cursor-grab active:cursor-grabbing"
                alt={`Property view ${activePhoto + 1}`}
              />
            </AnimatePresence>

            {/* Navigation Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-6 md:px-10 z-20">
              <button 
                onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                className="pointer-events-auto p-5 md:p-8 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100 active:scale-90"
              >
                <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); paginate(1); }}
                className="pointer-events-auto p-5 md:p-8 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100 active:scale-90"
              >
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
              </button>
            </div>

            {/* Top Badge */}
            <div className="absolute top-10 left-10 z-20 flex gap-4">
              {listing.virtualTourUrl && (
                <button 
                  onClick={() => document.getElementById('virtual-tour')?.scrollIntoView({ behavior: 'smooth' })}
                  className="glass-card px-6 py-3 rounded-full text-terra-text font-serif italic text-sm border border-white/20 hover:bg-white/40 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Box className="w-4 h-4 text-terra-green animate-pulse" />
                  <span>3D Portal</span>
                </button>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-10 left-10 right-10 z-20 flex items-center justify-between">
              <div className="glass-card px-8 py-4 rounded-full flex items-center gap-6 border border-white/20">
                <span className="text-terra-text font-serif italic text-lg">{activePhoto + 1} / {photos.length}</span>
                <div className="flex gap-1.5">
                  {photos.map((_: any, i: number) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-500 ${activePhoto === i ? 'w-8 bg-terra-green shadow-lg shadow-terra-green/40' : 'w-2 bg-terra-text/20'}`}
                    />
                  ))}
                </div>
              </div>
              <button 
                onClick={() => setIsFullScreen(true)}
                className="glass-card p-4 rounded-full text-terra-text border border-white/20 hover:bg-white/40 transition-all active:scale-95"
              >
                <Maximize2 className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Thumbnails Stream */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
            {photos.map((p: string, i: number) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`flex-shrink-0 w-32 md:w-48 aspect-[3/2] rounded-[24px] overflow-hidden cursor-pointer border-2 transition-all p-0.5 ${activePhoto === i ? 'border-terra-green ring-4 ring-terra-green/10' : 'border-transparent opacity-60 hover:opacity-100'}`}
                onClick={() => {
                  setDirection(i > activePhoto ? 1 : -1);
                  setActivePhoto(i);
                }}
              >
                <img src={p} className="w-full h-full object-cover rounded-[20px]" alt={`Thumbnail ${i + 1}`} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Full Screen Lightbox */}
        <AnimatePresence>
          {isFullScreen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
            >
              <button 
                onClick={() => setIsFullScreen(false)}
                className="absolute top-10 right-10 p-5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[510]"
              >
                <X className="w-8 h-8" />
              </button>

              <div className="relative w-full h-[80vh] flex items-center justify-center">
                 <AnimatePresence mode="wait">
                   <motion.img
                    key={activePhoto}
                    src={photos[activePhoto]}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.1, y: -20 }}
                    className="max-w-full max-h-full object-contain shadow-2xl"
                   />
                 </AnimatePresence>

                 <button 
                  onClick={() => paginate(-1)}
                  className="absolute left-0 p-6 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all"
                >
                  <ChevronLeft className="w-10 h-10" />
                </button>
                <button 
                  onClick={() => paginate(1)}
                  className="absolute right-0 p-6 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all"
                >
                  <ChevronRight className="w-10 h-10" />
                </button>
              </div>

              <div className="mt-12 text-center text-white/60 font-serif italic text-2xl">
                 {activePhoto + 1} / {photos.length} — {listing.title}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
          <div className="lg:col-span-2 space-y-20">
            {/* Header */}
            <div className="space-y-8">
              <div className="flex flex-wrap gap-3">
                <span className="bg-terra-green text-white text-[9px] uppercase font-bold tracking-[0.2em] px-5 py-2 rounded-full">For {listing.type}</span>
                <span className="bg-white border border-terra-border text-terra-text-muted text-[9px] uppercase font-bold tracking-[0.2em] px-5 py-2 rounded-full">{listing.category}</span>
                {listing.isVerified && (
                  <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 px-5 py-2 rounded-full border border-emerald-100 shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Verified Property</span>
                  </div>
                )}
                {user && (user.id === listing.ownerId || user.role === 'ADMIN') && (
                  <button 
                    onClick={handleVerify}
                    className={`text-[9px] uppercase font-bold tracking-[0.2em] px-5 py-2 rounded-full flex items-center transition-all ${
                      listing.isVerified 
                        ? 'bg-terra-sidebar text-terra-text-muted border border-terra-border hover:bg-red-50 hover:text-red-500' 
                        : 'bg-terra-green text-white hover:bg-terra-green/90 shadow-md active:scale-95'
                    }`}
                  >
                    <ShieldCheck className={`w-3.5 h-3.5 mr-2 ${listing.isVerified ? 'fill-current' : ''}`} />
                    {listing.isVerified ? 'Revoke Health Status' : 'Grant Health Status'}
                  </button>
                )}
              </div>
              <h1 className="text-6xl md:text-8xl font-serif text-terra-text leading-tight italic">
                {listing.title}
              </h1>
              <div className="flex items-center text-terra-text-muted font-serif text-2xl italic">
                <MapPin className="w-6 h-6 mr-3 text-terra-green" />
                {listing.address}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-12 bg-terra-sidebar p-12 rounded-[48px] border border-terra-border">
              <div className="text-center space-y-3">
                <p className="text-5xl font-serif text-terra-green">{listing.bhk}</p>
                <p className="text-[10px] font-bold text-terra-text-muted uppercase tracking-[0.3em]">BHK</p>
              </div>
              <div className="text-center space-y-3 border-x border-terra-border">
                <p className="text-5xl font-serif text-terra-green">{listing.area}</p>
                <p className="text-[10px] font-bold text-terra-text-muted uppercase tracking-[0.3em]">SQFT</p>
              </div>
              <div className="text-center space-y-3">
                <p className="text-2xl font-serif text-terra-green italic">{listing.furnishing.split(' ')[0]}</p>
                <p className="text-[10px] font-bold text-terra-text-muted uppercase tracking-[0.3em]">Furnishing</p>
              </div>
            </div>

            {/* About */}
            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                 <div className="w-12 h-0.5 bg-terra-green"></div>
                 <h2 className="text-4xl font-serif text-terra-text italic">Narrative</h2>
              </div>
              <p className="text-terra-text leading-relaxed font-normal text-2xl font-serif italic opacity-80">
                {listing.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="space-y-8">
              <h2 className="text-[10px] uppercase tracking-[0.3em] text-terra-text-muted font-bold">Inclusions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {amenities.map((a: string, i: number) => (
                  <div key={i} className="flex items-center space-x-4 p-6 bg-white border border-terra-border rounded-[32px] hover:bg-terra-sidebar transition-colors shadow-sm">
                    <div className="w-2 h-2 bg-terra-green rounded-full shadow-lg shadow-terra-green/20" />
                    <span className="text-sm font-bold text-terra-text uppercase tracking-widest">{a}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Specifications Card */}
            <div className="bg-white border border-terra-border rounded-[56px] overflow-hidden shadow-xl">
               <div className="p-12 space-y-10">
                  <div className="flex justify-between items-center">
                    <h2 className="text-4xl font-serif text-terra-text italic">Architecture & Spec</h2>
                    <button 
                      onClick={() => setShowSpecs(!showSpecs)}
                      className="text-terra-green font-bold text-[10px] uppercase tracking-widest hover:underline"
                    >
                      {showSpecs ? 'Collapse' : 'Expand Details'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
                    <div className="space-y-2">
                       <p className="text-[9px] font-bold text-terra-text-muted uppercase tracking-widest">Year Built</p>
                       <p className="text-xl font-serif italic text-terra-text">2023 (New Nest)</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[9px] font-bold text-terra-text-muted uppercase tracking-widest">Floor</p>
                       <p className="text-xl font-serif italic text-terra-text">12th of 25</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[9px] font-bold text-terra-text-muted uppercase tracking-widest">Facing</p>
                       <p className="text-xl font-serif italic text-terra-text">East / Vastu</p>
                    </div>
                  </div>

                  {showSpecs && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-10 border-t border-terra-border grid grid-cols-2 gap-10"
                    >
                      <div className="space-y-4">
                        <p className="text-[9px] font-bold text-terra-text-muted uppercase tracking-widest">Interior Style</p>
                        <p className="text-sm text-terra-text leading-relaxed">Modern minimalist with sustainable materials. Natural oak flooring and oversized windows for passive heating.</p>
                      </div>
                      <div className="space-y-4">
                        <p className="text-[9px] font-bold text-terra-text-muted uppercase tracking-widest">Ecology Impact</p>
                        <p className="text-sm text-terra-text leading-relaxed">Fitted with dual-flush systems and low-VOC paints. High-efficiency HVAC zone control.</p>
                      </div>
                    </motion.div>
                  )}
               </div>
            </div>

            {/* Floor Plan */}
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <h2 className="text-4xl font-serif text-terra-text italic">Blueprint</h2>
                <span className="text-[10px] font-bold text-terra-text-muted uppercase tracking-widest">Typical {listing.bhk}BHK Layout</span>
              </div>
              <div className="bg-white p-12 rounded-[56px] border border-terra-border shadow-xl group">
                <div className="aspect-video bg-terra-sidebar rounded-[40px] overflow-hidden border-2 border-dashed border-terra-border flex items-center justify-center relative">
                   <img src={listing.floorPlanUrl || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000"} className="w-full h-full object-cover opacity-10 blur-sm" alt="Floor plan" />
                   <div className="absolute flex flex-col items-center space-y-4 text-center px-10">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                        <Square className="w-6 h-6 text-terra-green" />
                      </div>
                      <div>
                        <p className="font-serif italic text-2xl text-terra-text">Architecture Layout Ready</p>
                        <p className="text-[10px] font-bold text-terra-text-muted uppercase tracking-widest mt-2">{listing.isVerified ? 'Verified Nest Asset' : 'Request verification for full access'}</p>
                      </div>
                      <button 
                        onClick={handleDownloadBlueprint}
                        className="bg-terra-green text-white px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-terra-green/90 transition-all active:scale-95 flex items-center space-x-2 shadow-lg shadow-terra-green/20"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Blueprint</span>
                      </button>
                   </div>
                </div>
              </div>
            </div>

            {/* Virtual Tour */}
            {listing.virtualTourUrl && (
              <div id="virtual-tour" className="space-y-10 scroll-mt-32">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-terra-green/10 rounded-full flex items-center justify-center">
                    <Box className="w-6 h-6 text-terra-green" />
                  </div>
                  <h2 className="text-4xl font-serif text-terra-text italic">3D Virtual Tour</h2>
                </div>
                <div className="bg-white p-4 rounded-[56px] border border-terra-border shadow-xl overflow-hidden aspect-video">
                  <iframe 
                    src={listing.virtualTourUrl} 
                    className="w-full h-full rounded-[40px]" 
                    allowFullScreen 
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {/* Mortgage Calculator */}
            {listing.type === 'BUY' && (
              <div className="space-y-10">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-terra-green/10 rounded-full flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-terra-green" />
                  </div>
                  <h2 className="text-4xl font-serif text-terra-text italic">Mortgage Estimator</h2>
                </div>
                <div className="bg-white p-12 rounded-[56px] border border-terra-border shadow-xl space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-bold text-terra-text-muted uppercase tracking-widest">
                        <span>Down Payment</span>
                        <span>₹{downPayment.toLocaleString('en-IN')}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max={listing.price} 
                        step="100000"
                        value={downPayment}
                        onChange={(e) => setDownPayment(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-terra-sidebar rounded-lg appearance-none cursor-pointer accent-terra-green"
                      />
                      <div className="flex justify-between text-[9px] text-terra-text-muted">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-bold text-terra-text-muted uppercase tracking-widest">
                        <span>Interest Rate</span>
                        <span>{interestRate}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="20" 
                        step="0.1"
                        value={interestRate}
                        onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-terra-sidebar rounded-lg appearance-none cursor-pointer accent-terra-green"
                      />
                      <div className="flex justify-between text-[9px] text-terra-text-muted">
                        <Percent className="w-3 h-3" />
                        <span>Up to 20%</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-bold text-terra-text-muted uppercase tracking-widest">
                        <span>Loan Term</span>
                        <span>{loanTerm} Years</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="30" 
                        step="1"
                        value={loanTerm}
                        onChange={(e) => setLoanTerm(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-terra-sidebar rounded-lg appearance-none cursor-pointer accent-terra-green"
                      />
                      <div className="flex justify-between text-[9px] text-terra-text-muted">
                        <Clock className="w-3 h-3" />
                        <span>Up to 30Y</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-10 bg-terra-sidebar rounded-[40px] border border-terra-border flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2 text-center md:text-left">
                      <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-terra-text-muted">Estimated Monthly EMI</h4>
                      <p className="text-5xl font-serif text-terra-green">₹{Math.round(emi).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-center md:text-right space-y-1">
                      <p className="text-sm font-serif italic text-terra-text">Principal Loan: ₹{(listing.price - downPayment).toLocaleString('en-IN')}</p>
                      <p className="text-[10px] font-bold text-terra-text-muted uppercase tracking-widest">Calculated with {interestRate}% APR</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

      {/* AI Concierge Widget */}
      <AIChatConcierge listing={listing} />

      <BookVisitModal 
        isOpen={isVisitModalOpen} 
        onClose={() => setIsVisitModalOpen(false)} 
        listingId={listing.id}
        listingTitle={listing.title}
      />

      {/* Nearby Amenities */}
      <NearbyAmenities lat={listing.lat} lng={listing.lng} />

      {/* Reviews Section */}
      <div className="space-y-12">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-0.5 bg-terra-green"></div>
          <h2 className="text-4xl font-serif text-terra-text italic">Resident Reflections</h2>
        </div>
        
        {listing.reviews && listing.reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {listing.reviews.map((review: any) => (
              <motion.div 
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white p-10 rounded-[40px] border border-terra-border shadow-sm space-y-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-terra-sidebar rounded-full flex items-center justify-center text-terra-green font-serif italic text-xl border border-terra-border">
                      {review.user?.name.charAt(0) || 'R'}
                    </div>
                    <div>
                      <p className="font-serif italic text-xl text-terra-text">{review.user?.name || 'Resident'}</p>
                      <p className="text-[9px] font-bold text-terra-text-muted uppercase tracking-widest">Verified Resident</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 bg-terra-sidebar px-3 py-1.5 rounded-full border border-terra-border">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-bold text-terra-text">{review.rating}.0</span>
                  </div>
                </div>
                <p className="text-terra-text-muted font-serif italic text-lg leading-relaxed">
                  "{review.comment}"
                </p>
                <div className="pt-4 border-t border-terra-border/50">
                   <p className="text-[9px] font-bold text-terra-text-muted uppercase tracking-[0.2em]">
                     {new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                   </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-terra-sidebar/50 rounded-[48px] border border-dashed border-terra-border space-y-4">
             <Star className="w-12 h-12 text-terra-border mx-auto" />
             <p className="text-terra-text-muted font-serif italic text-xl">This nest is waiting for its first shared reflection.</p>
          </div>
        )}
      </div>

      {/* Map */}
            <div className="space-y-10">
              <h2 className="text-4xl font-serif text-terra-text italic">Ecosystem Location</h2>
              <div className="h-[500px] w-full rounded-[48px] overflow-hidden border-8 border-white shadow-2xl">
                <PropertyMap 
                  listings={[listing]} 
                  center={{ lat: listing.lat, lng: listing.lng }} 
                  zoom={15} 
                />
              </div>
            </div>
          </div>

          {/* Sidebar Action Card */}
          <div className="space-y-10">
            <div className="sticky top-32 p-12 bg-white rounded-[56px] shadow-3xl border border-terra-card-border space-y-12">
              <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-[0.3em] text-terra-text-muted font-bold text-center block w-full">Investment Value</span>
                <p className="text-6xl font-serif text-terra-green text-center leading-none">
                  {formatPrice(listing.price)}
                  {listing.type === 'RENT' && <span className="text-xl font-normal text-terra-text-muted italic"> /mo</span>}
                </p>
              </div>

              <div className="space-y-4 pt-12 border-t border-terra-border">
                <button 
                  onClick={() => setIsVisitModalOpen(true)}
                  className="w-full bg-terra-green text-white py-6 rounded-3xl font-bold text-sm uppercase tracking-widest shadow-2xl shadow-terra-green/40 hover:bg-terra-green/90 transition-all active:scale-95"
                >
                  Book Site Visit
                </button>
                <button className="w-full bg-terra-text text-white py-6 rounded-3xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-all active:scale-95">
                  Connect with Owner
                </button>
              </div>

              <div className="pt-12 border-t border-terra-border">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 border-2 border-terra-border rounded-full p-1 shadow-inner">
                    <div className="w-full h-full bg-terra-green-light rounded-full overflow-hidden">
                      <img src={listing.owner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.owner.name)}&background=d9e2d5&color=5a6e5a`} alt="Owner" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                       <p className="font-serif text-xl italic text-terra-text">{listing.owner.name}</p>
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    </div>
                    <p className="text-[10px] font-bold text-terra-text-muted uppercase tracking-[0.2em]">Curator & Verified</p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-terra-sidebar rounded-[32px] space-y-4 border border-terra-border">
                <div className="flex items-center space-x-3 text-terra-green">
                   <Sparkles className="w-6 h-6" />
                   <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold">Nest Insight</h4>
                </div>
                <p className="text-sm text-terra-text font-serif italic text-center leading-relaxed">"The position of this nest ensures optimal morning light for your indoor flora."</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
