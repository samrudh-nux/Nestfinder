import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Sparkles, Home as HomeIcon, Building, Map as MapIcon, ShieldCheck, Users, MessageSquare, Heart, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../lib/api';
import PropertyCard from '../components/PropertyCard';
import { useAuthStore } from '../store/authStore';

export default function Home() {
  const [query, setQuery] = useState('');
  const [isMagicSearch, setIsMagicSearch] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [featuredListings, setFeaturedListings] = useState([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/listings?limit=4');
        setFeaturedListings(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) return;
      setRecLoading(true);
      try {
        const res = await api.post('/ai/recommend');
        const recListings = await Promise.all(
          res.data.slice(0, 4).map(async (rec: any) => {
            try {
              const lRes = await api.get(`/listings/${rec.id}`);
              return { ...lRes.data, ...rec };
            } catch {
              return null;
            }
          })
        );
        setRecommendations(recListings.filter(l => l !== null));
      } catch (e) {
        console.error(e);
      } finally {
        setRecLoading(false);
      }
    };
    fetchRecommendations();
  }, [user]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return navigate('/search');

    if (isMagicSearch) {
      setMagicLoading(true);
      try {
        const res = await api.post('/ai/magic-search', { query });
        const filters = res.data;
        const params = new URLSearchParams();
        if (filters.city) params.set('city', filters.city);
        if (filters.category) params.set('category', filters.category);
        if (filters.type) params.set('type', filters.type);
        if (filters.minPrice) params.set('minPrice', filters.minPrice);
        if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
        if (filters.bhk) params.set('bhk', filters.bhk);
        navigate(`/search?${params.toString()}`);
      } catch (e) {
        console.error(e);
        navigate(`/search?q=${encodeURIComponent(query)}`);
      } finally {
        setMagicLoading(false);
      }
    } else {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const communities = [
    { id: 1, name: 'Bandra Creative Nest', members: '1.2k', activity: '24 new posts', icon: '🎨', color: 'bg-blue-50 text-blue-600' },
    { id: 2, name: 'HSR Startup Ecosystem', members: '3.4k', activity: '56 new posts', icon: '🚀', color: 'bg-orange-50 text-orange-600' },
    { id: 3, name: 'Dwarka Family Circle', members: '2.8k', activity: '12 new posts', icon: '🏡', color: 'bg-green-50 text-green-600' },
  ];

  return (
    <div className="space-y-24 pb-20 bg-terra-bg">
      {/* Hero Section */}
      <section className="relative h-[700px] flex items-center justify-center p-6 md:p-12">
        <div className="relative w-full h-full bg-terra-green rounded-[48px] overflow-hidden flex items-center p-8 md:p-24 text-white shadow-2xl">
          <div className="relative z-10 w-full md:w-3/5 space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3">
                <span className="px-4 py-1.5 bg-white/10 border border-white/10 rounded-full text-[10px] uppercase tracking-[0.2em] font-medium backdrop-blur-md">The sun is gentle today</span>
                <span className="flex items-center space-x-1 text-terra-green-light font-bold text-[10px] uppercase tracking-widest animate-pulse">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Powered Search Active</span>
                </span>
              </div>
              <h1 className="text-6xl md:text-8xl font-serif leading-tight">
                Your garden <br/>is <i className="opacity-80">thriving</i>
              </h1>
              <p className="text-lg opacity-90 max-w-lg font-light leading-relaxed">
                NestFinder matches you with properties that feel like home. Discover spaces that resonate with your personal energy using our God-tier AI engine.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="space-y-4"
            >
               <form 
                onSubmit={handleSearch}
                className="flex flex-col md:flex-row gap-4 max-w-2xl bg-white/10 backdrop-blur-lg p-2 rounded-[32px] border border-white/10 shadow-lg relative group"
              >
                <div className="flex-1 flex items-center px-4 space-x-3">
                  {isMagicSearch ? (
                    <Sparkles className="w-5 h-5 text-terra-green-light animate-pulse" />
                  ) : (
                    <Search className="w-5 h-5 text-white/50" />
                  )}
                  <input 
                    type="text" 
                    placeholder={isMagicSearch ? "Describe your dream home (e.g. 'Cheap 2BHK in Mumbai near a park')..." : "Where do you want to grow?"} 
                    className="w-full py-5 text-white focus:outline-none placeholder:text-white/40 font-medium bg-transparent text-lg"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={magicLoading}
                  className="bg-white text-terra-green px-10 py-5 rounded-[24px] font-bold transition-all hover:bg-terra-green-light active:scale-95 flex items-center space-x-2"
                >
                  {magicLoading ? (
                     <div className="w-5 h-5 border-2 border-terra-green border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Explore</span>
                      <Search className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* AI Toggle Indicator */}
                <div 
                  onClick={() => setIsMagicSearch(!isMagicSearch)}
                  className={`absolute -top-3 left-8 px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest cursor-pointer transition-all ${isMagicSearch ? 'bg-terra-green-light text-terra-green shadow-lg scale-110' : 'bg-white/20 text-white hover:bg-white/30'}`}
                >
                  {isMagicSearch ? '✨ Magic AI Search' : '🔍 Standard Search'}
                </div>
              </form>
              <div className="flex items-center space-x-4 px-6 text-[10px] uppercase tracking-widest font-bold text-white/60">
                 <span>Trending:</span>
                 <button onClick={() => {setQuery('Luxury flat in Bandra'); setIsMagicSearch(true);}} className="hover:text-white transition-colors">"Luxury flat in Bandra"</button>
                 <button onClick={() => {setQuery('Cheap PG in Bangalore'); setIsMagicSearch(true);}} className="hover:text-white transition-colors">"Cheap PG in Bangalore"</button>
              </div>
            </motion.div>
          </div>

          {/* Abstract Decorations */}
          <div className="absolute right-[-100px] top-[-100px] w-96 h-96 bg-terra-green-light/10 rounded-full blur-[120px]"></div>
          <div className="absolute right-20 bottom-10 hidden lg:block">
             <div className="relative w-80 h-[450px] bg-white/10 rounded-t-[140px] border border-white/10 backdrop-blur-md flex flex-col items-center justify-center p-8 space-y-6">
                <div className="w-20 h-20 bg-white/20 rounded-full animate-bounce"></div>
                <div className="w-3/4 h-4 bg-white/20 rounded-full"></div>
                <div className="w-1/2 h-4 bg-white/20 rounded-full"></div>
                <div className="absolute top-10 left-10 w-2 h-2 bg-terra-green-light rounded-full"></div>
                <div className="absolute bottom-20 right-10 w-4 h-4 bg-terra-green-light/40 rounded-full"></div>
             </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 py-16 border-y border-terra-border">
          {[
            { label: 'Green Spaces', value: '1,200+' },
            { label: 'Thriving Users', value: '8k+' },
            { label: 'Ecosystems', value: '25+' },
            { label: 'Perfect Matches', value: '15k+' },
          ].map((stat) => (
            <div key={stat.label} className="text-center space-y-2">
              <p className="text-4xl font-serif text-terra-green">{stat.value}</p>
              <p className="text-[10px] font-bold text-terra-text-muted uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Join Community Section (God Tier) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[11px] uppercase tracking-[0.3em] text-terra-green font-bold">The Nest Network</span>
          <h2 className="text-5xl md:text-7xl font-serif text-terra-text">Join your new <br/><i className="opacity-80">community</i></h2>
          <p className="text-lg text-terra-text-muted">Don't just find a house, find your tribe. Connect with neighbors before you even move in.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {communities.map((comm) => (
            <motion.div 
               key={comm.id}
               whileHover={{ y: -12 }}
               className="bg-white border border-terra-border rounded-[48px] p-10 space-y-8 shadow-sm hover:shadow-2xl transition-all duration-500 group"
            >
              <div className={`w-20 h-20 ${comm.color} rounded-3xl flex items-center justify-center text-4xl shadow-inner`}>
                {comm.icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif text-terra-text group-hover:text-terra-green transition-colors">{comm.name}</h3>
                <div className="flex items-center space-x-4 text-xs font-bold text-terra-text-muted uppercase tracking-widest">
                   <div className="flex items-center space-x-1">
                     <Users className="w-3 h-3" />
                     <span>{comm.members} Members</span>
                   </div>
                   <div className="flex items-center space-x-1 text-terra-green">
                     <MessageSquare className="w-3 h-3" />
                     <span>{comm.activity}</span>
                   </div>
                </div>
              </div>
              <p className="text-sm text-terra-text-muted leading-relaxed">
                Connect with artists, creatives and fellow urban dwellers in this vibrant Mumbai hub.
              </p>
              <button className="w-full py-5 bg-terra-sidebar text-terra-text font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-terra-green hover:text-white transition-all transform group-active:scale-95">
                Join Nest
              </button>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
           <button className="flex items-center space-x-2 text-terra-green font-bold hover:underline tracking-tight">
              <span>See all communities</span>
              <ChevronRight className="w-4 h-4" />
           </button>
        </div>
      </section>

      {/* AI Recommendations */}
      {user && (recommendations.length > 0 || recLoading) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-12">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-8 h-8 text-terra-green animate-pulse" />
                <h2 className="text-4xl font-serif text-terra-text italic leading-tight">Grown for You</h2>
              </div>
              <p className="text-terra-text-muted text-lg">AI-personalized matches based on your unique lifestyle.</p>
            </div>
            <Link to="/onboarding" className="text-terra-green font-bold hover:underline tracking-tight">Retrain AI →</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {recLoading ? (
               Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-[500px] bg-terra-sidebar rounded-[40px] animate-pulse" />
              ))
            ) : (
              recommendations.map((listing: any) => (
                <div key={listing.id} className="group flex flex-col h-full bg-white border border-terra-border rounded-[40px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                  <div className="relative h-64 overflow-hidden">
                    <img src={JSON.parse(listing.photos || '[]')[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                    <div className="absolute top-4 right-4 bg-terra-green text-white px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-lg">
                      {listing.matchPercentage}% Match
                    </div>
                  </div>
                  <div className="p-8 space-y-4 flex-1 flex flex-col">
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-terra-text-muted font-bold">{listing.locality}, {listing.city}</p>
                      <h3 className="text-2xl font-serif text-terra-text truncate group-hover:text-terra-green transition-colors">{listing.title}</h3>
                    </div>
                    <div className="bg-terra-sidebar/50 p-4 rounded-3xl border border-terra-border/50">
                      <p className="text-xs text-terra-text leading-relaxed font-medium italic">"{listing.explanation}"</p>
                    </div>
                    <div className="pt-4 mt-auto flex justify-between items-center">
                       <span className="text-2xl font-serif text-terra-green">₹{(listing.price / 100000).toFixed(2)}L</span>
                       <Link 
                        to={`/listings/${listing.id}`}
                        className="w-12 h-12 bg-terra-sidebar text-terra-text rounded-full flex items-center justify-center hover:bg-terra-green hover:text-white transition-all transform group-hover:scale-110"
                       >
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                       </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Featured Properties */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h2 className="text-4xl font-serif text-terra-text">Hand-picked Nests</h2>
            <p className="text-terra-text-muted text-lg">Curated environments for your next chapter.</p>
          </div>
          <Link to="/search" className="text-terra-green font-bold hover:underline tracking-tight">View Journal →</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {featuredListings.length > 0 ? (
            featuredListings.map((listing) => (
              <PropertyCard key={listing.id} listing={listing} />
            ))
          ) : (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-[450px] bg-terra-sidebar rounded-[40px] animate-pulse" />
            ))
          )}
        </div>
      </section>

      {/* AI Feature Callouts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              icon: Sparkles,
              title: "Smart Matching",
              desc: "Our algorithms feel your energy and match you with properties that align with your lifestyle.",
              bg: "bg-terra-sidebar",
              color: "text-terra-green"
            },
            {
              icon: ShieldCheck,
              title: "Verified Grounds",
              desc: "Identity and property integrity are our soil. We verify every listing for your peace of mind.",
              bg: "bg-terra-green-light/40",
              color: "text-terra-green"
            },
            {
              icon: MapIcon,
              title: "Local Insights",
              desc: "Understand the photosynthesis profile, walkability, and safety of your future ecosystem.",
              bg: "bg-white border border-terra-border",
              color: "text-terra-green"
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className={`${feature.bg} p-10 rounded-[40px] space-y-6 transition-all shadow-sm`}
            >
              <div className={`${feature.color} bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-md`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-serif text-terra-text">{feature.title}</h3>
              <p className="text-terra-text-muted leading-relaxed font-normal">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-terra-green rounded-[48px] p-12 md:p-24 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-terra-green-light/20 rounded-full -ml-32 -mb-32 blur-3xl" />
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tight leading-tight">Ready to find <br/>your<i>new home?</i></h2>
            <p className="text-xl text-white/80 max-w-xl mx-auto font-light">
              Join thousands of happy homeowners who found their perfect match through NestFinder.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link 
                to="/onboarding" 
                className="bg-white text-terra-green px-10 py-5 rounded-2xl font-bold text-lg hover:bg-terra-sidebar transition-all shadow-xl"
              >
                Start AI Matching
              </Link>
              <Link 
                to="/search" 
                className="bg-terra-green-light/20 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all border border-white/20 backdrop-blur-sm"
              >
                Browse Listings
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
