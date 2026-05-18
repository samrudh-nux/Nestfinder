import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  InfoWindow, 
  useAdvancedMarkerRef,
  useMap
} from '@vis.gl/react-google-maps';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, X, Navigation, Layers, Compass } from 'lucide-react';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

const cityCenters: Record<string, { lat: number, lng: number }> = {
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Delhi': { lat: 28.6139, lng: 77.2090 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 }
};

interface PropertyMapProps {
  listings: any[];
  centerCity?: string;
  center?: { lat: number, lng: number };
  zoom?: number;
  onBoundsChange?: (bounds: any) => void;
}

function MarkerWithInfo({ listing }: { listing: any }) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoWindowShown, setInfoWindowShown] = useState(false);

  const priceFormatted = useMemo(() => {
    if (listing.price >= 10000000) return `₹${(listing.price / 10000000).toFixed(1)}Cr`;
    if (listing.price >= 100000) return `₹${(listing.price / 100000).toFixed(1)}L`;
    if (listing.price >= 1000) return `₹${(listing.price / 1000).toFixed(0)}k`;
    return `₹${listing.price}`;
  }, [listing.price]);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: listing.lat, lng: listing.lng }}
        onClick={() => setInfoWindowShown(true)}
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1, y: -5 }}
          className="relative group cursor-pointer"
        >
          <div className="bg-terra-green text-white px-4 py-2 rounded-full font-bold text-sm shadow-xl border-2 border-white flex items-center space-x-2 group-hover:bg-terra-green-light transition-all">
            <span>{priceFormatted}</span>
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-terra-green rotate-45 border-r border-b border-white" />
        </motion.div>
      </AdvancedMarker>

      {infoWindowShown && (
        <InfoWindow
          anchor={marker}
          onCloseClick={() => setInfoWindowShown(false)}
          className="property-infowindow"
        >
          <div className="w-64 overflow-hidden rounded-2xl bg-white p-0">
            <img 
              src={JSON.parse(listing.photos || '[]')[0] || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be'} 
              className="w-full h-32 object-cover" 
              alt={listing.title} 
            />
            <div className="p-4 space-y-2">
              <h4 className="font-serif italic text-lg text-terra-text leading-tight">{listing.title}</h4>
              <div className="flex items-center text-terra-text-muted text-xs font-bold space-x-1">
                <MapPin className="w-3 h-3" />
                <span>{listing.locality}, {listing.city}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-terra-green font-black text-lg">₹{listing.price.toLocaleString('en-IN')}</span>
                <a 
                  href={`/property/${listing.id}`}
                  className="bg-terra-sidebar px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-terra-text hover:bg-terra-green hover:text-white transition-all shadow-sm"
                >
                  View Nest
                </a>
              </div>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

function MapHandlers({ onBoundsChange, centerCity, center, zoom }: { 
  onBoundsChange?: (bounds: any) => void, 
  centerCity?: string,
  center?: { lat: number, lng: number },
  zoom?: number
}) {
  const map = useMap();
  const lastBoundsRef = useRef<string>('');

  useEffect(() => {
    if (!map) return;
    
    if (center) {
      map.panTo(center);
      if (zoom) map.setZoom(zoom);
    } else if (centerCity && cityCenters[centerCity]) {
      map.panTo(cityCenters[centerCity]);
      map.setZoom(13);
    }
  }, [map, centerCity, center, zoom]);

  useEffect(() => {
    if (!map || !onBoundsChange) return;

    const listener = map.addListener('bounds_changed', () => {
      const bounds = map.getBounds();
      if (bounds) {
        const boundsStr = bounds.toString();
        if (boundsStr !== lastBoundsRef.current) {
          lastBoundsRef.current = boundsStr;
          onBoundsChange({
            getSouth: () => bounds.getSouthWest().lat(),
            getNorth: () => bounds.getNorthEast().lat(),
            getWest: () => bounds.getSouthWest().lng(),
            getEast: () => bounds.getNorthEast().lng()
          });
        }
      }
    });

    return () => google.maps.event.removeListener(listener);
  }, [map, onBoundsChange]);

  return null;
}

export default function PropertyMap({ listings, centerCity, center, zoom, onBoundsChange }: PropertyMapProps) {
  const [mapId] = useState('DEMO_MAP_ID'); 

  if (!hasValidKey) {
    return (
      <div className="h-full w-full bg-terra-sidebar rounded-[48px] border border-terra-border flex items-center justify-center p-12 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-terra-green/5 to-transparent animate-pulse" />
        <div className="text-center max-w-lg space-y-8 relative z-10">
          <div className="w-24 h-24 bg-white/80 backdrop-blur-xl border border-terra-border rounded-[32px] flex items-center justify-center mx-auto shadow-2xl">
            <Compass className="w-12 h-12 text-terra-green animate-pulse" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-serif text-terra-text italic leading-tight">Cartographic Access Required</h2>
            <p className="text-terra-text-muted text-lg leading-relaxed font-light px-8">
              To experience our <i className="text-terra-green font-medium">god-tier</i> mapping intelligence, please integrate your Google Maps Platform key in the system secrets.
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl border border-terra-border rounded-[32px] p-8 text-left space-y-6 shadow-xl">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-terra-green text-white rounded-full flex items-center justify-center shrink-0 font-bold text-sm">1</div>
              <p className="text-sm text-terra-text-muted pt-1">
                Obtain keys from <a href="https://console.cloud.google.com/google/maps-apis/start" className="text-terra-green underline underline-offset-4" target="_blank" rel="noopener">Google Cloud Console</a>
              </p>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-terra-green text-white rounded-full flex items-center justify-center shrink-0 font-bold text-sm">2</div>
              <p className="text-sm text-terra-text-muted pt-1">
                Navigate to <b>Settings</b> (⚙️) → <b>Secrets</b>
              </p>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-terra-green text-white rounded-full flex items-center justify-center shrink-0 font-bold text-sm">3</div>
              <p className="text-sm text-terra-text-muted pt-1">
                Add <code>GOOGLE_MAPS_PLATFORM_KEY</code> and save
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const mapCenter = center || (centerCity && cityCenters[centerCity] ? cityCenters[centerCity] : { lat: 19.0760, lng: 72.8777 });

  return (
    <div className="h-full w-full rounded-[48px] overflow-hidden relative shadow-2xl border-2 border-white/50 bg-terra-sidebar">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={mapCenter}
          defaultZoom={zoom || 11}
          mapId={mapId}
          gestureHandling="greedy"
          disableDefaultUI={true}
          className="w-full h-full"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        >
          {listings.map((listing) => (
            <MarkerWithInfo key={listing.id} listing={listing} />
          ))}
          <MapHandlers onBoundsChange={onBoundsChange} centerCity={centerCity} center={center} zoom={zoom} />
        </Map>
      </APIProvider>

      {/* Map Control Overlays */}
      <div className="absolute top-8 right-8 flex flex-col gap-3">
        <button 
          title="Satellite View"
          className="p-4 bg-white/80 backdrop-blur-xl border border-terra-border rounded-2xl shadow-xl text-terra-text hover:bg-terra-green hover:text-white transition-all active:scale-95"
        >
          <Layers className="w-6 h-6" />
        </button>
        <button 
          title="Recenter"
          className="p-4 bg-white/80 backdrop-blur-xl border border-terra-border rounded-2xl shadow-xl text-terra-text hover:bg-terra-green hover:text-white transition-all active:scale-95"
        >
          <Navigation className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
