import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter, Grid, Map as MapIcon, SlidersHorizontal, MapPin, Sparkles } from 'lucide-react';
import api from '../lib/api';
import PropertyCard from '../components/PropertyCard';
import PropertyMap from '../components/Map';
import { motion, AnimatePresence } from 'motion/react';

const categories = ['FLAT', 'HOUSE', 'PG', 'HOSTEL', 'COMMERCIAL', 'PLOT'];
const cities = ['Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad'];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filters state from URL
  const city = searchParams.get('city') || '';
  const type = searchParams.get('type') || '';
  const category = searchParams.get('category') || '';
  const bhk = searchParams.get('bhk') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/listings', { params: Object.fromEntries(searchParams) });
      setListings(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [searchParams]);

  const updateFilters = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  const handleBoundsChange = (bounds: any) => {
    const newParams = new URLSearchParams(searchParams);
    if (bounds) {
      newParams.set('minLat', bounds.getSouth().toString());
      newParams.set('maxLat', bounds.getNorth().toString());
      newParams.set('minLng', bounds.getWest().toString());
      newParams.set('maxLng', bounds.getEast().toString());
    } else {
      newParams.delete('minLat');
      newParams.delete('maxLat');
      newParams.delete('minLng');
      newParams.delete('maxLng');
    }
    setSearchParams(newParams);
  };

  const [magicQuery, setMagicQuery] = useState(searchParams.get('q') || '');
  const [magicLoading, setMagicLoading] = useState(false);

  const handleMagicSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicQuery.trim()) return;
    
    setMagicLoading(true);
    try {
      const res = await api.post('/ai/magic-search', { query: magicQuery });
      const filters = res.data;
      const newParams = new URLSearchParams();
      if (filters.city) newParams.set('city', filters.city);
      if (filters.category) newParams.set('category', filters.category);
      if (filters.type) newParams.set('type', filters.type);
      if (filters.minPrice) newParams.set('minPrice', filters.minPrice);
      if (filters.maxPrice) newParams.set('maxPrice', filters.maxPrice);
      if (filters.bhk) newParams.set('bhk', filters.bhk);
      setSearchParams(newParams);
    } catch (e) {
      console.error(e);
      updateFilters('q', magicQuery);
    } finally {
      setMagicLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-12 min-h-[calc(100vh-80px)] bg-terra-bg">
      {/* Sidebar Filters */}
      <aside className={`md:w-[280px] bg-terra-sidebar rounded-[40px] p-8 border border-terra-border h-fit space-y-12 ${showFilters ? 'block' : 'hidden md:block'}`}>
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-terra-text-muted font-bold">Discovery</span>
          <h2 className="text-4xl font-serif text-terra-green italic">Filters</h2>
        </div>

        <div className="space-y-10">
          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest text-terra-text-muted font-bold">Preferred City</label>
            <div className="flex flex-wrap gap-2">
              {cities.map((c) => (
                <button
                  key={c}
                  onClick={() => updateFilters('city', c)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all ${
                    city === c ? 'bg-terra-green text-white border-terra-green' : 'bg-white text-terra-text border-terra-border hover:border-terra-green'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest text-terra-text-muted font-bold">Purpose</label>
            <div className="p-1 bg-white rounded-2xl border border-terra-border flex gap-1 shadow-sm">
              {['RENT', 'BUY'].map((t) => (
                <button
                  key={t}
                  onClick={() => updateFilters('type', t)}
                  className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-bold rounded-[14px] transition-all ${
                    type === t ? 'bg-terra-green text-white' : 'text-terra-text-muted'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest text-terra-text-muted font-bold">Category</label>
            <select 
              value={category}
              onChange={(e) => updateFilters('category', e.target.value)}
              className="w-full p-4 bg-white border border-terra-border rounded-2xl font-bold text-terra-text text-sm focus:outline-none focus:ring-4 focus:ring-terra-green/10"
            >
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest text-terra-text-muted font-bold">Price Range</label>
            <div className="flex gap-2 items-center">
              <input 
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => updateFilters('minPrice', e.target.value)}
                className="w-full p-3 bg-white border border-terra-border rounded-xl font-bold text-terra-text text-xs focus:outline-none focus:ring-4 focus:ring-terra-green/10"
              />
              <span className="text-terra-text-muted text-xs font-bold">—</span>
              <input 
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => updateFilters('maxPrice', e.target.value)}
                className="w-full p-3 bg-white border border-terra-border rounded-xl font-bold text-terra-text text-xs focus:outline-none focus:ring-4 focus:ring-terra-green/10"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest text-terra-text-muted font-bold">Size (BHK)</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => updateFilters('bhk', n.toString())}
                  className={`aspect-square rounded-[18px] flex items-center justify-center text-sm font-bold border transition-all ${
                    bhk === n.toString() ? 'bg-terra-green text-white border-terra-green' : 'bg-white text-terra-text border-terra-border hover:border-terra-green'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={() => setSearchParams(new URLSearchParams())}
          className="w-full py-4 text-xs font-bold text-terra-text-muted uppercase tracking-widest hover:text-terra-green transition-colors"
        >
          Reset Garden
        </button>
      </aside>

      {/* Main Content */}
      <section className="flex-1 h-full space-y-10">
        <header className="space-y-12">
          <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b border-terra-border pb-12">
            <div className="space-y-2">
              <h1 className="text-6xl font-serif text-terra-text leading-tight">
                {listings.length} <i className="opacity-60 italic">Results</i>
              </h1>
              <p className="text-terra-text-muted text-xl font-light">Ecosystem discovery in {city || 'all cities'}</p>
            </div>

            <div className="flex items-center bg-terra-sidebar border border-terra-border p-1.5 rounded-[24px] shadow-sm">
              <button 
                onClick={() => setView('grid')}
                className={`p-3 rounded-2xl transition-all ${view === 'grid' ? 'bg-white text-terra-green shadow-md px-6' : 'text-terra-text-muted px-6 hover:text-terra-green'}`}
              >
                <div className="flex items-center space-x-2">
                  <Grid className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Grid</span>
                </div>
              </button>
              <button 
                onClick={() => setView('map')}
                className={`p-3 rounded-2xl transition-all ${view === 'map' ? 'bg-white text-terra-green shadow-md px-6' : 'text-terra-text-muted px-6 hover:text-terra-green'}`}
              >
                <div className="flex items-center space-x-2">
                  <MapIcon className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Map</span>
                </div>
              </button>
            </div>
          </div>

          <form 
            onSubmit={handleMagicSearch}
            className="w-full bg-white border-2 border-terra-green/20 rounded-[40px] p-2 flex flex-col md:flex-row gap-4 shadow-xl shadow-terra-green/5 focus-within:border-terra-green transition-all"
          >
            <div className="flex-1 flex items-center px-8 space-x-4">
              <Sparkles className={`w-6 h-6 text-terra-green ${magicLoading ? 'animate-spin' : 'animate-pulse'}`} />
              <input 
                type="text"
                placeholder="Ask the AI (e.g. 'Cozy 1BHK in Mumbai under 40k with balcony')"
                className="w-full py-6 text-xl text-terra-text focus:outline-none placeholder:text-terra-text-muted/40 font-serif italic"
                value={magicQuery}
                onChange={(e) => setMagicQuery(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              disabled={magicLoading}
              className="bg-terra-green text-white px-12 py-6 rounded-[32px] font-bold text-lg hover:bg-terra-green-light active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              {magicLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Magic Search</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </header>

        <div className="h-full">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-[450px] bg-terra-sidebar rounded-[40px] animate-pulse border border-terra-border" />
              ))}
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
              <AnimatePresence>
                {listings.map((listing) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                  >
                    <PropertyCard listing={listing} />
                  </motion.div>
                ))}
              </AnimatePresence>
              {listings.length === 0 && (
                <div className="col-span-full py-32 text-center space-y-6">
                  <div className="w-24 h-24 bg-terra-sidebar rounded-full flex items-center justify-center mx-auto">
                    <SearchIcon className="w-10 h-10 text-terra-text-muted" />
                  </div>
                  <h3 className="text-3xl font-serif text-terra-text italic">The garden looks empty</h3>
                  <p className="text-terra-text-muted font-medium max-w-xs mx-auto text-lg leading-relaxed">No properties found with current filters. Try broadening your horizons.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[calc(100vh-250px)] sticky top-28">
              <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
                {(searchParams.get('minLat')) && (
                  <button 
                    onClick={() => handleBoundsChange(null)}
                    className="bg-white px-4 py-2 rounded-xl shadow-lg border border-terra-border text-[10px] font-bold uppercase tracking-widest text-terra-green flex items-center hover:bg-terra-sidebar transition-all"
                  >
                    Clear Area Filter
                  </button>
                )}
              </div>
              <PropertyMap listings={listings} centerCity={city} onBoundsChange={handleBoundsChange} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
