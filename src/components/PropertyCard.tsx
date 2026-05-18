import { Heart, MapPin, BedDouble, Square, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

interface Listing {
  id: string;
  title: string;
  price: number;
  type: string;
  bhk: number;
  area: number;
  city: string;
  locality: string;
  photos: string; // JSON string
  isVerified: boolean;
  ownerDetail?: { name: string };
}

export default function PropertyCard({ listing }: { listing: any }) {
  const photos = listing.photos ? JSON.parse(listing.photos) : [];
  const mainPhoto = photos[0] || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=800';

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-terra-card-border flex flex-col justify-between group"
    >
      <Link to={`/property/${listing.id}`} className="block relative aspect-[4/5] overflow-hidden p-4">
        <div className="w-full h-full rounded-2xl overflow-hidden bg-terra-sidebar">
          <img 
            src={mainPhoto} 
            alt={listing.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          />
        </div>
        <div className="absolute top-8 left-8 flex gap-2">
          {listing.type === 'RENT' && (
            <span className="bg-terra-green/90 backdrop-blur-md text-white text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1.5 rounded-full">
              Lease
            </span>
          )}
          {listing.type === 'BUY' && (
            <span className="bg-terra-text/90 backdrop-blur-md text-white text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1.5 rounded-full">
              Acquire
            </span>
          )}
        </div>
        <button 
          onClick={(e) => { e.preventDefault(); /* Favourite logic */ }}
          className="absolute top-8 right-8 w-10 h-10 border border-white/20 bg-black/10 backdrop-blur-md rounded-full text-white hover:text-white hover:bg-terra-green transition-all flex items-center justify-center"
        >
          <Heart className="w-5 h-5" />
        </button>
      </Link>

      <div className="px-8 pb-8 space-y-6">
        <div>
          <h3 className="font-serif text-2xl text-terra-text line-clamp-1 group-hover:text-terra-green transition-colors leading-tight">
            {listing.title}
          </h3>
          <p className="text-xs text-terra-text-muted italic mt-1">{listing.locality}, {listing.city}</p>
        </div>

        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-terra-text-muted font-bold">Investment</span>
            <p className="text-3xl font-serif text-terra-green leading-none">
              {formatPrice(listing.price)}
              {listing.type === 'RENT' && <span className="text-sm font-normal text-terra-text-muted italic"> /mo</span>}
            </p>
          </div>
          <div className="flex space-x-2">
            <div className="w-10 h-10 rounded-full border border-terra-border flex flex-col items-center justify-center group-hover:bg-terra-green group-hover:text-white transition-colors">
              <span className="text-[10px] font-bold leading-none">{listing.bhk}</span>
              <span className="text-[8px] font-medium leading-none mt-0.5">BHK</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-terra-border w-full"></div>

        <div className="flex justify-between items-center">
          <Link 
            to={`/property/${listing.id}`}
            className="text-xs font-bold text-terra-green uppercase tracking-widest hover:underline"
          >
            Visit Property
          </Link>
          {listing.isVerified && (
            <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
              <ShieldCheck className="w-3 h-3" />
              <span className="text-[8px] font-bold uppercase tracking-widest leading-none">Verified</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
