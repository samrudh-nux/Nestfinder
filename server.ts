import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { createToken, verifyToken } from './src/lib/auth-server.ts';
import { generateContent, generateJSON } from './src/lib/gemini.ts';

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Assets
app.use('/uploads', express.static(uploadsDir));

// Middleware to protect routes
const authenticate = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  const payload = await verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });
  req.user = payload;
  next();
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: role || 'BUYER' }
    });
    const token = await createToken({ id: user.id, email: user.email, role: user.role });
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
  } catch (e: any) {
    res.status(400).json({ error: e.message.includes('unique constraint') ? 'Email already exists' : e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = await createToken({ id: user.id, email: user.email, role: user.role });
  res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
});

app.get('/api/auth/me', authenticate, async (req: any, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role, preferences: user.preferences });
});

app.put('/api/users/preferences', authenticate, async (req: any, res) => {
  const { preferences } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { preferences }
    });
    res.json(user);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// --- LISTING ROUTES ---
app.get('/api/listings', async (req: any, res) => {
  const { city, category, type, minPrice, maxPrice, bhk, owner, minLat, maxLat, minLng, maxLng } = req.query;
  const filters: any = { isAvailable: true };

  if (owner === 'true') {
    // We need to be authenticated for this
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);
    if (!payload) return res.status(401).json({ error: 'Invalid token' });
    filters.ownerId = payload.id;
    // For owner view, we might want to see even non-available ones, but let's keep it simple
    delete filters.isAvailable; 
  }

  if (city) filters.city = city as string;
  if (category) filters.category = category as string;
  if (type) filters.type = type as string;
  if (minPrice || maxPrice) {
    filters.price = {};
    const min = parseInt(minPrice as string);
    const max = parseInt(maxPrice as string);
    if (!isNaN(min)) filters.price.gte = min;
    if (!isNaN(max)) filters.price.lte = max;
    if (Object.keys(filters.price).length === 0) delete filters.price;
  }
  if (bhk) filters.bhk = parseInt(bhk as string);

  if (minLat && maxLat && minLng && maxLng) {
    filters.lat = {
      gte: parseFloat(minLat as string),
      lte: parseFloat(maxLat as string)
    };
    filters.lng = {
      gte: parseFloat(minLng as string),
      lte: parseFloat(maxLng as string)
    };
  }

  const listings = await prisma.listing.findMany({
    where: filters,
    orderBy: { createdAt: 'desc' },
    include: { owner: { select: { name: true, avatar: true } } }
  });
  res.json(listings);
});

app.get('/api/listings/:id', async (req, res) => {
  const listing = await prisma.listing.findUnique({
    where: { id: req.params.id },
    include: { 
      owner: { select: { name: true, avatar: true, phone: true } },
      reviews: { include: { user: { select: { name: true } } } }
    }
  });
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  res.json(listing);
});

app.post('/api/listings', authenticate, async (req: any, res) => {
  if (req.user.role === 'BUYER') return res.status(403).json({ error: 'Buyers cannot create listings' });
  const { amenities, photos, ...data } = req.body;
  try {
    const listing = await prisma.listing.create({
      data: {
        ...data,
        ownerId: req.user.id,
        amenities: JSON.stringify(amenities || []),
        photos: JSON.stringify(photos || []),
      }
    });
    res.json(listing);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/listings/:id/verify', authenticate, async (req: any, res) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    
    if (listing.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to verify this listing' });
    }

    const updated = await prisma.listing.update({
      where: { id: req.params.id },
      data: { isVerified: !listing.isVerified }
    });
    res.json(updated);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// --- AI ROUTES ---
const localInsights: Record<string, any> = {
  'Mumbai': {
    'Bandra': {
      amenities: 'Trendy cafes, high-end boutiques, and the iconic Bandra-Worli Sea Link. Vibrant nightlife and street shopping at Linking Road.',
      schools: 'Home to prestigious institutions like St. Stanislaus, St. Andrews, and Mount Mary Convent.',
      safety: 'Generally very safe with high police patrolling and active community watch. Well-lit streets.',
      events: 'Annual Bandra Fair (September), weekly Farmers Market at D’Monte Park, and Tata Mumbai Marathon passing through.',
      community: 'Active cycling groups, heritage walks, strong local arts scene, and weekly open-mic nights.'
    },
    'Andheri': {
      amenities: 'A major commercial hub with excellent connectivity, numerous malls like Infiniti, and health centers like Kokilaben Hospital.',
      schools: 'Proximity to Ryan International, Billabong High, and Oberoi International School.',
      safety: 'Vibrant and busy 24/7, well-lit major roads with moderate to high safety ratings.',
      events: 'Live music gigs at Hard Rock Cafe and various venues, frequent Bollywood pop-up markets in Lokhandwala.',
      community: 'Thriving media and acting community, shared co-working meetups, and intense morning fitness groups at Lokhandwala Garden.'
    },
    'Powai': {
      amenities: 'Hiranandani Gardens with neoclassical architecture, Powai Lake, and high-end restaurants.',
      schools: 'Hiranandani Foundation School and SM Shetty School.',
      safety: 'Very safe, upscale neighborhood with private security patrols in many areas.',
      events: 'Annual Hiranandani Powai Run, grand Ganpati celebrations at Powai Lake.',
      community: 'Tech founders, corporate professionals, and active lake-side walking communities.'
    }
  },
  'Bangalore': {
    'HSR Layout': {
      amenities: 'Wide tree-lined roads, beautiful parks, and a thriving startup ecosystem with numerous cafes.',
      schools: 'Near NIFT, National Public School, and Lawrence High School.',
      safety: 'One of the safest residential areas in Bangalore with active resident welfare associations.',
      events: 'HSR Habba festival, periodic organic terrace gardening workshops, and weekend pet fairs.',
      community: 'Startup networking meetups, Sunday runner groups in sector parks, and active cycling clubs.'
    },
    'Whitefield': {
      amenities: 'IT parks like ITPL, major malls like Phoenix Marketcity, and luxury hotels. Proximity to metro connectivity.',
      schools: 'Top schools like The Deens Academy and Vydehi School of Excellence.',
      safety: 'Safe but faces heavy peak-hour traffic; Gated communities provide high security.',
      events: 'Cultural festivals at Jagriti Theatre, food festivals at VR Bengaluru, and periodic flea markets.',
      community: 'Biking clubs, yoga retreats, tech community hackathons, and expat groups.'
    },
    'Indiranagar': {
      amenities: 'Premium 100ft road with global brands, pub capital of the city, and multiple boutique stores.',
      schools: 'National Public School (NPS) Indiranagar and Frank Anthony Public School.',
      safety: 'Safe residential pockets with active street monitoring and well-lit commercial zones.',
      events: 'Music festivals at local microbreweries, regular art workshops at local studios.',
      community: 'Creative professionals, musicians, and active fitness communities at local gyms.'
    }
  },
  'Delhi': {
    'Dwarka': {
      amenities: 'Self-sufficient sub-city with numerous parks, sports complexes, and excellent Metro connectivity.',
      schools: 'Venkateshwar International School and Delhi Public School Dwarka.',
      safety: 'Well-planned sectors with active police presence and wide roads.',
      events: 'Ramleela celebrations, periodic neighborhood carnivals at sector parks.',
      community: 'Active retiree groups, sports enthusiasts at the Dwarka Sports Complex, and neighborhood library circles.'
    },
    'Saket': {
      amenities: 'Select Citywalk mall, PVR Anupam, and heritage proximity to Qutub Minar. High-end healthcare at Max Hospital.',
      schools: 'Amity International and Apeejay School.',
      safety: 'Generally safe with busy commercial areas; residential lanes are well-managed.',
      events: 'Fashion shows at the malls, regular exhibitions at the Kiran Nadar Museum of Art.',
      community: 'Fashion influencers, artsy crowd, and active weekend walkers at Garden of Five Senses.'
    }
  },
  'Pune': {
    'Kothrud': {
      amenities: 'Rich cultural heritage, Kamala Nehru Park, and plenty of local eateries serving authentic Maharashtrian cuisine.',
      schools: 'Abhinav Vidyalaya and New India School are top-rated here.',
      safety: 'Known as one of the safest and most family-friendly suburbs in Pune.',
      events: 'Classical music concerts (Sawai Gandharva), Ganeshotsav cultural programs.',
      community: 'Strong Marathi cultural community, trekking groups to nearby forts like Sinhagad, and senior citizen laughter clubs.'
    }
  },
  'Hyderabad': {
    'Jubilee Hills': {
      amenities: 'Exclusive residential area with top-tier hospitals like Apollo, luxury dining, and beautiful parks like KBR Park.',
      schools: 'Oakridge International and P. Obul Reddy Public School.',
      safety: 'Extremely high security due to high-profile residents and private security details.',
      events: 'Exotic art exhibitions at State Gallery of Art, premium culinary festivals at luxury hotels.',
      community: 'Golfing groups at Hyderabad Golf Club, luxury car clubs, and heritage conservation circles.'
    }
  }
};

app.post('/api/ai/generate-description', authenticate, async (req, res) => {
  const { propertyData } = req.body;
  const city = propertyData.city;
  const locality = propertyData.locality;
  
  const insights = localInsights[city]?.[locality] || {
    amenities: 'Local markets, parks, and essential services nearby.',
    schools: 'Quality educational institutions in the vicinity.',
    safety: 'A peaceful and developing residential neighborhood.'
  };

  const prompt = `Generate a compelling real estate description for the following property:
${JSON.stringify(propertyData, null, 2)}

Incorporate these local insights if they resonate with the property's location:
- Neighborhood Amenities: ${insights.amenities}
- School Ratings/Proximity: ${insights.schools}
- Safety/Vibe: ${insights.safety}

Include key features, lifestyle benefits, and a professional yet inviting tone. Keep it around 150 words. Focus on how these local insights enhance the living experience.`;

  try {
    const description = await generateContent(prompt);
    res.json({ description });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/ai/chat', async (req, res) => {
  const { messages, listingContext } = req.body;
  const systemPrompt = listingContext 
    ? `You are an AI real estate assistant for NestFinder. You are helping a user with a specific property: ${JSON.stringify(listingContext)}. Answer their questions accurately based on this context. If you don't know something, suggest they contact the owner.`
    : `You are an AI real estate assistant for NestFinder. Help users find properties, understand real estate terms, and guide them through the platform.`;
  
  const history = messages.slice(0, -1).map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
  const currentMessage = messages[messages.length - 1].content;
  
  const prompt = `${systemPrompt}\n\nHistory:\n${history}\nUser: ${currentMessage}\nAssistant:`;
  
  try {
    const response = await generateContent(prompt);
    res.json({ response });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/ai/recommend', authenticate, async (req: any, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user || !user.preferences) return res.status(400).json({ error: 'No user preferences found. Please complete the onboarding quiz.' });
  
  const preferences = JSON.parse(user.preferences);
  const listings = await prisma.listing.findMany({ 
    where: { city: preferences.city, isAvailable: true },
    take: 20 
  });
  
  const prompt = `You are a real estate expert. Based on the user's detailed preferences:
${JSON.stringify(preferences, null, 2)}

Specifically consider:
1. City: ${preferences.city}
2. Size: ${preferences.bhk} BHK
3. Lifestyle: ${preferences.lifestyle?.join(', ') || 'General'}
4. Preferred Furnishing: ${preferences.furnishing || 'Any'}

Rank these properties from most to least suitable. For the top 3, write a 2-3 sentence personalized explanation focusing on how the property fits their specific lifestyle (e.g., if they are a pet owner, mentioned pet-friendliness; if they are a fitness enthusiast, mention gym/parks).

Properties:
${JSON.stringify(listings.map(l => ({ id: l.id, title: l.title, price: l.price, bhk: l.bhk, locality: l.locality, category: l.category, furnishing: l.furnishing })), null, 2)}

Return strictly valid JSON in this format:
[
  { "id": "listingId", "matchPercentage": 95, "explanation": "..." }
]`;
  
  try {
    const recommendations = await generateJSON(prompt);
    res.json(recommendations);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/ai/property-chat', async (req, res) => {
  try {
    const { listing, message, history } = req.body;
    if (!listing) {
      return res.status(400).json({ error: 'Listing data is required' });
    }

    const city = listing.city;
    const locality = listing.locality;
    
    const insights = localInsights[city]?.[locality] || {
      amenities: 'Local markets, parks, and essential services nearby.',
      schools: 'Quality educational institutions in the vicinity.',
      safety: 'A peaceful and developing residential neighborhood.',
      events: 'Regular community gatherings and seasonal local festivals.',
      community: 'Diverse resident demographic with a friendly atmosphere.'
    };
    
    const prompt = `You are a helpful AI real estate concierge for "NestFinder". You are helping a user with questions about a specific property listing.
  
Property Details:
Title: ${listing.title}
Price: ${listing.price}
BHK: ${listing.bhk}
Area: ${listing.area} sqft
Locality: ${locality}
City: ${city}
Category: ${listing.category}
Type: ${listing.type}
Description: ${listing.description}
Amenities: ${listing.amenities}
Verified: ${listing.isVerified}

Local Neighborhood Insights (Specific to ${locality}, ${city}):
- Amenities: ${insights.amenities}
- Schools: ${insights.schools}
- Safety: ${insights.safety}
- Upcoming Events: ${insights.events}
- Community Vibe/Activities: ${insights.community}

User Question: "${message}"

Your Goal:
1. Answer the question specifically using the property details and local insights provided.
2. When asked about the neighborhood, highlight the specific events and community activities mentioned above.
3. Be professional, warm, and highlight the "ecosystem" and "growth" theme of NestFinder.
4. Keep answers concise but deeply insightful (2-4 sentences).

Previous Conversation Context:
${JSON.stringify(history, null, 2)}`;

    const response = await generateContent(prompt);
    res.json({ response });
  } catch (e: any) {
    console.error('AI Chat Error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/ai/property-chat/feedback', async (req, res) => {
  const { listingId, query, response, rating, feedback } = req.body;
  const user = (req as any).user;

  try {
    const newFeedback = await prisma.aIChatFeedback.create({
      data: {
        userId: user?.id,
        listingId,
        query,
        response,
        rating,
        feedback
      }
    });
    res.json(newFeedback);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/ai/magic-search', async (req, res) => {
  const { query } = req.body;
  
  const prompt = `You are an expert AI real estate search engine. Parse the following natural language search query into structured search filters.
Query: "${query}"

Valid Categories: FLAT, HOUSE, PG, HOSTEL, COMMERCIAL, PLOT
Valid Types: RENT, BUY
Valid Cities: Mumbai, Bangalore, Delhi, Pune, Hyderabad

Return strictly valid JSON in this format:
{
  "city": "string or null",
  "category": "string or null",
  "type": "string or null",
  "minPrice": number or null,
  "maxPrice": number or null,
  "bhk": number or null,
  "explanation": "A short, catchy explanation of what you're searching for"
}

If the user mentions "cheap" or "affordable", set maxPrice accordingly for the city (e.g. Mumbai rent < 30000, buy < 1Cr).
If they mention "luxury", set minPrice high.`;
  
  try {
    const filters = await generateJSON(prompt);
    res.json(filters);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// --- COMMUNITY ROUTES ---
app.post('/api/community/join', authenticate, async (req: any, res) => {
  // Mock joining a community
  res.json({ message: 'Successfully joined the community!' });
});

// --- VISIT ROUTES ---
app.post('/api/listings/:id/visits', authenticate, async (req: any, res) => {
  const { date, timeSlot, message } = req.body;
  try {
    const visit = await prisma.siteVisit.create({
      data: {
        date: new Date(date),
        timeSlot,
        message,
        listingId: req.params.id,
        visitorId: req.user.id
      }
    });
    res.json(visit);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// --- VITE MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
