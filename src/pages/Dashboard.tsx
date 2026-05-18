import { useState, useEffect } from 'react';
import { 
  Building, LayoutDashboard, PlusCircle, Settings, 
  Eye, MessageSquare, Calendar, Trash2, Edit3, 
  CheckCircle2, Clock, XCircle, ChevronRight, Upload, Sparkles, Wand2,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('listings');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'RENT',
    category: 'FLAT',
    price: 0,
    bhk: 1,
    area: 0,
    city: 'Mumbai',
    locality: '',
    address: '',
    lat: 19.0760,
    lng: 72.8777,
    furnishing: 'UNFURNISHED',
    amenities: [] as string[],
    photos: [] as string[]
  });

  const [aiGenerating, setAiGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        const res = await api.get('/listings?owner=true'); // Server will need to handle this
        setListings(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMyListings();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    const newPhotos: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Max 5MB.`);
        continue;
      }

      const reader = new FileReader();
      const promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
      });
      reader.readAsDataURL(file);
      const base64 = await promise;
      newPhotos.push(base64);
    }

    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos].slice(0, 10)
    }));
    setUploading(false);
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleGenerateDescription = async () => {
    setAiGenerating(true);
    try {
      const res = await api.post('/ai/generate-description', { propertyData: formData });
      setFormData({ ...formData, description: res.data.description });
    } catch (e) {
      console.error(e);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/listings', formData);
      setShowAddModal(false);
      // Refresh
      const res = await api.get('/listings?owner=true');
      setListings(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await api.put(`/listings/${id}/verify`);
      const res = await api.get('/listings?owner=true');
      setListings(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const sidebarItems = [
    { id: 'listings', label: 'My Listings', icon: Building },
    { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
    { id: 'visits', label: 'Site Visits', icon: Calendar },
    { id: 'settings', label: 'Profile Settings', icon: Settings },
  ];

  return (
    <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-80px)] flex bg-terra-bg relative">
      {/* Sidebar */}
      <aside className="w-80 bg-terra-sidebar border-r border-terra-border p-8 flex flex-col h-[calc(100vh-80px)] sticky top-20 overflow-hidden shrink-0">
        <div className="flex-1 space-y-12 overflow-y-auto scrollbar-hide pr-2">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-terra-green rounded-2xl flex items-center justify-center shadow-md">
              <LayoutDashboard className="text-white w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-serif text-terra-text italic leading-tight">Dashboard</h2>
              <p className="text-[10px] font-bold text-terra-text-muted uppercase tracking-[0.2em]">{user?.role} Account</p>
            </div>
          </div>

          <nav className="space-y-3">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                  activeTab === item.id 
                    ? 'bg-terra-green text-white shadow-md' 
                    : 'text-terra-text-muted hover:bg-white/50 hover:text-terra-text'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm tracking-tight">{item.label}</span>
                {activeTab === item.id && <ChevronRight className="ml-auto w-4 h-4" />}
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-8 mt-auto shrink-0">
          <div className="bg-terra-green/5 border border-terra-green/10 rounded-[32px] p-6 space-y-4 relative overflow-hidden backdrop-blur-sm group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-terra-green/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-terra-green/20 transition-colors" />
            <div className="relative z-10 space-y-4">
              <h3 className="text-lg font-serif text-terra-green italic">Need help?</h3>
              <p className="text-xs text-terra-text-muted font-medium leading-relaxed">Chat with our AI Advisor for tailored listing tips.</p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('open-chat'))}
                className="w-full bg-terra-green text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-terra-green/90 transition-all active:scale-[0.98] shadow-sm flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-3 h-3" />
                <span>Talk to Advisor</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 space-y-12 overflow-y-auto">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h1 className="text-5xl font-serif text-terra-text italic leading-tight">
              {sidebarItems.find(i => i.id === activeTab)?.label}
            </h1>
            <p className="text-terra-text-muted font-medium text-lg leading-relaxed">Manage your real estate portfolio operations here.</p>
          </div>
          {activeTab === 'listings' && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-terra-green hover:bg-terra-green/90 text-white px-8 py-4 rounded-2xl font-bold flex items-center space-x-3 shadow-md active:scale-95 transition-all group"
            >
              <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              <span className="uppercase tracking-widest text-[10px]">Add New Listing</span>
            </button>
          )}
        </div>

        {activeTab === 'listings' && (
          <div className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-terra-sidebar rounded-3xl animate-pulse border border-terra-border" />)}
              </div>
            ) : listings.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {listings.map((l: any) => (
                  <div key={l.id} className="bg-white p-6 rounded-[40px] border border-terra-card-border shadow-sm flex items-center gap-8 hover:shadow-md transition-all group">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden shrink-0 border border-terra-border">
                      <img src={JSON.parse(l.photos)[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-2xl font-serif text-terra-text italic leading-tight">{l.title}</h3>
                        {l.isVerified && (
                          <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Verified</span>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-terra-text-muted uppercase tracking-[0.2em]">{l.locality}, {l.city} | ₹{l.price.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex items-center space-x-10 px-10 border-x border-terra-border">
                      <div className="text-center">
                        <p className="text-2xl font-serif text-terra-text">0</p>
                        <p className="text-[9px] font-bold text-terra-text-muted uppercase tracking-[0.2em]">Views</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-serif text-terra-text">0</p>
                        <p className="text-[9px] font-bold text-terra-text-muted uppercase tracking-[0.2em]">Inquiries</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleVerify(l.id)}
                        className={`px-4 py-2.5 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all flex items-center space-x-2 ${
                          l.isVerified 
                            ? 'bg-terra-green text-white shadow-lg shadow-terra-green/20' 
                            : 'bg-terra-sidebar text-terra-text-muted hover:bg-terra-green hover:text-white border border-terra-border'
                        }`}
                        title={l.isVerified ? "Remove Verification" : "Verify Listing"}
                      >
                        <ShieldCheck className={`w-4 h-4 ${l.isVerified ? 'fill-white' : ''}`} />
                        <span>{l.isVerified ? 'Verified' : 'Verify'}</span>
                      </button>
                      <button className="p-3 text-terra-text-muted hover:bg-terra-sidebar hover:text-terra-green rounded-xl transition-all border border-transparent hover:border-terra-border"><Edit3 className="w-5 h-5" /></button>
                      <button className="p-3 text-terra-text-muted hover:bg-red-50 hover:text-red-400 rounded-xl transition-all border border-transparent hover:border-red-100"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-terra-sidebar p-20 rounded-[48px] border-2 border-dashed border-terra-border text-center space-y-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto text-terra-border shadow-inner">
                  <Building className="w-10 h-10" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-serif text-terra-text italic">Your garden is quiet</h3>
                  <p className="text-terra-text-muted font-medium max-w-sm mx-auto">Ready to list your first property? We'll help you with AI-driven nurturing.</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-terra-green text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-terra-green/90 transition-all shadow-md"
                >
                  Create Listing
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Listing Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-terra-bg w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[48px] shadow-2xl flex flex-col border border-terra-border"
            >
              <div className="p-10 bg-terra-green text-white flex justify-between items-center shrink-0">
                <div className="space-y-1">
                  <h2 className="text-4xl font-serif italic tracking-tight">Create Listing</h2>
                  <p className="text-white/80 font-light text-sm">Nurturing your property listing in 4 easy steps.</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-4 hover:bg-white/10 rounded-full transition-colors">
                  <XCircle className="w-8 h-8" />
                </button>
              </div>

              <form onSubmit={handleCreateListing} className="p-10 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-terra-text-muted uppercase tracking-[0.2em]">Listing Title</label>
                      <input 
                        required
                        placeholder="e.g. Modern 2BHK with Sea View"
                        className="w-full p-5 bg-white border border-terra-border rounded-3xl focus:outline-none focus:ring-4 focus:ring-terra-green/10 focus:border-terra-green font-serif italic text-lg text-terra-text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-terra-text-muted uppercase tracking-[0.2em]">Type</label>
                        <select 
                          className="w-full p-5 bg-white border border-terra-border rounded-3xl font-bold text-sm text-terra-text"
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                          <option value="RENT">Rent</option>
                          <option value="BUY">Buy</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-terra-text-muted uppercase tracking-[0.2em]">Category</label>
                        <select 
                          className="w-full p-5 bg-white border border-terra-border rounded-3xl font-bold text-sm text-terra-text"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-terra-text-muted uppercase tracking-[0.2em]">Price (₹)</label>
                        <input 
                          type="number"
                          required
                          className="w-full p-5 bg-white border border-terra-border rounded-3xl font-bold text-sm text-terra-text"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-terra-text-muted uppercase tracking-[0.2em]">BHK</label>
                        <input 
                          type="number"
                          required
                          className="w-full p-5 bg-white border border-terra-border rounded-3xl font-bold text-sm text-terra-text"
                          value={formData.bhk}
                          onChange={(e) => setFormData({ ...formData, bhk: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 flex flex-col h-full">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-terra-text-muted uppercase tracking-[0.2em]">Botanical Description</label>
                      <button 
                        type="button"
                        onClick={handleGenerateDescription}
                        disabled={aiGenerating}
                        className="text-[9px] font-bold text-terra-green flex items-center space-x-1.5 hover:underline disabled:opacity-50 tracking-widest uppercase"
                      >
                        {aiGenerating ? <Clock className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        <span>AI Nurture</span>
                      </button>
                    </div>
                    <textarea 
                      required
                      placeholder="Tell us about the property's unique atmosphere..."
                      className="flex-1 w-full p-6 bg-white border border-terra-border rounded-3xl focus:outline-none focus:ring-4 focus:ring-terra-green/10 focus:border-terra-green font-normal text-sm min-h-[250px] leading-relaxed text-terra-text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <label className="text-[10px] font-bold text-terra-text-muted uppercase tracking-[0.2em]">Ecosystem Details</label>
                    <div className="space-y-4">
                      <select 
                        className="w-full p-5 bg-white border border-terra-border rounded-3xl font-bold text-sm text-terra-text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      >
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <input 
                        placeholder="Locality / Area"
                        className="w-full p-5 bg-white border border-terra-border rounded-3xl font-bold text-sm text-terra-text"
                        value={formData.locality}
                        onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                      />
                      <textarea 
                        placeholder="Full Address"
                        className="w-full p-5 bg-white border border-terra-border rounded-3xl font-bold text-sm h-32 text-terra-text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <label className="text-[10px] font-bold text-terra-text-muted uppercase tracking-[0.2em]">Visual Atmosphere</label>
                    <div className="space-y-4">
                      <div 
                        onClick={() => document.getElementById('photo-upload')?.click()}
                        className="border-2 border-dashed border-terra-border rounded-[40px] p-12 text-center space-y-6 bg-terra-sidebar/50 hover:bg-white hover:border-terra-green-light transition-all cursor-pointer group shadow-inner"
                      >
                        <input 
                          type="file" 
                          id="photo-upload" 
                          className="hidden" 
                          multiple 
                          accept="image/*"
                          onChange={handleFileUpload}
                        />
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform group-hover:rotate-3">
                          {uploading ? (
                            <Clock className="w-8 h-8 text-terra-green animate-spin" />
                          ) : (
                            <Upload className="w-8 h-8 text-terra-green" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <p className="font-serif italic text-xl text-terra-text">Click to add photos</p>
                          <p className="text-[10px] font-bold text-terra-text-muted uppercase tracking-widest">Up to 10 photos, max 5MB ({formData.photos.length}/10)</p>
                        </div>
                      </div>

                      {formData.photos.length > 0 && (
                        <div className="grid grid-cols-5 gap-3">
                          {formData.photos.map((photo, index) => (
                            <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-terra-border group">
                              <img src={photo} className="w-full h-full object-cover" alt="" />
                              <button 
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <XCircle className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-terra-border flex justify-end">
                  <button 
                    type="submit"
                    className="bg-terra-green hover:bg-terra-green/90 text-white px-12 py-5 rounded-[24px] font-bold text-base shadow-lg transition-all active:scale-95 uppercase tracking-[0.2em]"
                  >
                    Publish Listing
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const categories = ['FLAT', 'HOUSE', 'PG', 'HOSTEL', 'COMMERCIAL', 'PLOT'];
const cities = ['Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad'];
