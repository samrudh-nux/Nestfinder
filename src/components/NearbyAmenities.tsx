import { useEffect, useState } from 'react';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import { TreePine, GraduationCap, Hospital, TrainFront, Star, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

interface Amenity {
  id: string;
  name: string;
  type: string;
  rating?: number;
  distance?: string;
  address?: string;
  location?: google.maps.LatLngLiteral;
}

const AMENITY_TYPES = [
  { label: 'Parks', icon: TreePine, types: ['park'], color: 'bg-green-50 text-green-600' },
  { label: 'Schools', icon: GraduationCap, types: ['school', 'university'], color: 'bg-blue-50 text-blue-600' },
  { label: 'Healthcare', icon: Hospital, types: ['hospital', 'doctor'], color: 'bg-red-50 text-red-600' },
  { label: 'Transit', icon: TrainFront, types: ['transit_station', 'bus_station', 'train_station'], color: 'bg-orange-50 text-orange-600' },
];

function AmenitiesList({ lat, lng }: { lat: number; lng: number }) {
  const placesLib = useMapsLibrary('places');
  const [amenities, setAmenities] = useState<Record<string, Amenity[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(AMENITY_TYPES[0].label);

  useEffect(() => {
    if (!placesLib || !lat || !lng) return;

    const fetchAmenities = async () => {
      setLoading(true);
      const results: Record<string, Amenity[]> = {};

      for (const group of AMENITY_TYPES) {
        try {
          // Note: searchNearby (New) uses different parameters than the legacy one.
          // According to skill CF10, it needs locationRestriction: { center, radius }
          const request: google.maps.places.SearchNearbyRequest = {
            locationRestriction: {
              center: { lat, lng },
              radius: 2000, // 2km radius
            },
            includedTypes: group.types,
            maxResultCount: 6,
            fields: ['displayName', 'location', 'rating', 'formattedAddress', 'id']
          };

          const { places } = await placesLib.Place.searchNearby(request);
          
          results[group.label] = (places || []).map(p => ({
            id: p.id as string,
            name: p.displayName as string,
            type: group.label,
            rating: p.rating,
            address: p.formattedAddress,
            location: p.location ? { lat: p.location.lat(), lng: p.location.lng() } : undefined
          }));
        } catch (error) {
          console.error(`Error fetching ${group.label}:`, error);
          results[group.label] = [];
        }
      }

      setAmenities(results);
      setLoading(false);
    };

    fetchAmenities();
  }, [placesLib, lat, lng]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-40 bg-terra-sidebar rounded-[32px] border border-terra-border"></div>
        ))}
      </div>
    );
  }

  const currentAmenities = amenities[activeTab] || [];

  return (
    <div className="space-y-10">
      {/* Tabs */}
      <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
        {AMENITY_TYPES.map((group) => {
          const Icon = group.icon;
          const isActive = activeTab === group.label;
          return (
            <button
              key={group.label}
              onClick={() => setActiveTab(group.label)}
              className={`flex items-center space-x-3 px-8 py-4 rounded-full border transition-all shrink-0 font-bold text-[10px] uppercase tracking-widest ${
                isActive 
                  ? 'bg-terra-green text-white border-terra-green shadow-xl shadow-terra-green/20' 
                  : 'bg-white text-terra-text-muted border-terra-border hover:bg-terra-sidebar'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : group.color.split(' ')[1]}`} />
              <span>{group.label}</span>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[8px] ${isActive ? 'bg-white/20' : 'bg-terra-sidebar'}`}>
                {amenities[group.label]?.length || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {currentAmenities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentAmenities.map((item, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={item.id}
              className="group bg-white p-8 rounded-[40px] border border-terra-border hover:border-terra-green transition-all hover:shadow-2xl hover:shadow-terra-green/5"
            >
              <div className="flex flex-col h-full justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xl font-serif italic text-terra-text leading-snug group-hover:text-terra-green transition-colors">
                      {item.name}
                    </h4>
                    {item.rating && (
                      <div className="flex items-center space-x-1 bg-terra-sidebar px-2.5 py-1 rounded-full border border-terra-border">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-[10px] font-bold text-terra-text">{item.rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-start space-x-2 text-terra-text-muted">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium leading-relaxed line-clamp-2 uppercase tracking-wide">
                      {item.address || 'Location information unavailable'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-terra-border/50">
                  <span className="text-[9px] font-bold text-terra-text-muted uppercase tracking-[0.2em]">Within 2km range</span>
                  <div className={`p-2 rounded-xl ${AMENITY_TYPES.find(t => t.label === activeTab)?.color}`}>
                    <TrainFront className="w-4 h-4 opacity-70" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-terra-sidebar/50 rounded-[48px] border border-dashed border-terra-border">
           <p className="text-terra-text-muted font-serif italic text-xl">No {activeTab.toLowerCase()} found within our ecosystem radius.</p>
        </div>
      )}
    </div>
  );
}

export default function NearbyAmenities({ lat, lng }: { lat: number; lng: number }) {
  if (!API_KEY) {
    return (
      <div className="p-12 bg-terra-sidebar rounded-[48px] border border-terra-border text-center space-y-6">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
          <MapPin className="w-8 h-8 text-terra-green" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-serif italic text-terra-text">Maps Integration Pending</h3>
          <p className="text-sm text-terra-text-muted max-w-md mx-auto">To see nearby amenities like parks and schools, please set up your Google Maps Platform key in AI Studio Secrets.</p>
        </div>
        <div className="pt-6">
           <a 
            href="https://console.cloud.google.com/google/maps-apis/start" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-terra-green text-white px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-terra-green/90 transition-all"
           >
            Get API Key
           </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-0.5 bg-terra-green"></div>
        <h2 className="text-4xl font-serif text-terra-text italic">Neighborhood Ecology</h2>
      </div>
      
      <APIProvider apiKey={API_KEY} version="weekly">
        <AmenitiesList lat={lat} lng={lng} />
      </APIProvider>
    </div>
  );
}
