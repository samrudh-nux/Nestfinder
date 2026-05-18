import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);
  
  // Clear existing data
  await prisma.favourite.deleteMany();
  await prisma.siteVisit.deleteMany();
  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();
  
  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nestfinder.com' },
    update: {},
    create: {
      email: 'admin@nestfinder.com',
      password,
      name: 'NestFinder Admin',
      role: 'ADMIN'
    }
  });

  // Create Owner
  const owner = await prisma.user.upsert({
    where: { email: 'owner@nestfinder.com' },
    update: {},
    create: {
      email: 'owner@nestfinder.com',
      password,
      name: 'Rajesh Kumar',
      role: 'OWNER'
    }
  });

  // Create Developer/Target User
  const devUser = await prisma.user.upsert({
    where: { email: 'jadhavsanket1029@gmail.com' },
    update: {},
    create: {
      email: 'jadhavsanket1029@gmail.com',
      password: await bcrypt.hash('Sanket@123', 10),
      name: 'Sanket Jadhav',
      role: 'BUYER'
    }
  });

  // Create Listings
  const listings = [
    {
      title: 'Luxury 3BHK with Sea View',
      description: 'Stunning luxury apartment in the heart of Mumbai with panoramic sea views. Fully furnished with premium fittings. Experience the ultimate elite lifestyle with world-class amenities at your doorstep.',
      type: 'RENT',
      category: 'FLAT',
      price: 150000,
      bhk: 3,
      area: 1800,
      city: 'Mumbai',
      locality: 'Worli',
      address: 'Sea View Heights, Worli Sea Face, Mumbai 400018',
      lat: 19.0178,
      lng: 72.8172,
      furnishing: 'FULLY',
      amenities: JSON.stringify(['Swimming Pool', 'Gym', 'Parking', 'Sea View', 'Concierge']),
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00', 
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'
      ]),
      virtualTourUrl: 'https://my.matterport.com/show/?m=sx6uD3bc8GZ',
      floorPlanUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000',
      isVerified: true,
      ownerId: owner.id
    },
    {
      title: 'Modern Studio in Tech Corridor',
      description: 'Perfect for working professionals. High-speed internet, power backup, and minimalist design. Located just minutes away from major IT parks in HSR Layout.',
      type: 'RENT',
      category: 'FLAT',
      price: 35000,
      bhk: 1,
      area: 600,
      city: 'Bangalore',
      locality: 'HSR Layout',
      address: 'TechHub Residency, Sector 2, HSR Layout, Bangalore 560102',
      lat: 12.9121,
      lng: 77.6446,
      furnishing: 'SEMI',
      amenities: JSON.stringify(['High-speed WiFi', 'Power Backup', 'CCTV', 'Lift']),
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'
      ]),
      isVerified: true,
      ownerId: owner.id
    },
    {
      title: 'Spacious Villa with Private Garden',
      description: 'Elegant villa situated in a quiet gated community. Features a private pool and landscaped garden. Perfect for families seeking peace and luxury in the premium Koregaon Park area.',
      type: 'BUY',
      category: 'HOUSE',
      price: 85000000,
      bhk: 4,
      area: 4500,
      city: 'Pune',
      locality: 'Koregaon Park',
      address: 'Eden Gardens, Lane 7, Koregaon Park, Pune 411001',
      lat: 18.5362,
      lng: 73.8940,
      furnishing: 'UNFURNISHED',
      amenities: JSON.stringify(['Private Pool', 'Garden', 'Security', 'Club House', 'Tennis Court']),
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1613977257363-707ba9348227',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'
      ]),
      virtualTourUrl: 'https://my.matterport.com/show/?m=sx6uD3bc8GZ',
      isVerified: true,
      ownerId: owner.id
    },
    {
      title: 'Boutique Penthouse near Jubilee Hills',
      description: 'Exclusive 4BHK penthouse with private terrace and home theatre. Located in one of Hyderabad\'s most sought-after neighborhoods with stunning city views.',
      type: 'RENT',
      category: 'FLAT',
      price: 250000,
      bhk: 4,
      area: 3800,
      city: 'Hyderabad',
      locality: 'Jubilee Hills',
      address: 'Skyline Terrace, Road No. 36, Jubilee Hills, Hyderabad 500033',
      lat: 17.4326,
      lng: 78.4071,
      furnishing: 'FULLY',
      amenities: JSON.stringify(['Home Theatre', 'Private Terrace', 'Jacuzzi', '24/7 Security']),
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1567496898669-ee935f5f647a',
        'https://images.unsplash.com/photo-1542312951-44755c9133bd'
      ]),
      isVerified: true,
      ownerId: owner.id
    },
    {
      title: 'Cozy Artist Studio in Bandra',
      description: 'Charming studio apartment with lots of natural light. Perfect for creative individuals wanting to be in the heart of Mumbai\'s cultural hub.',
      type: 'RENT',
      category: 'FLAT',
      price: 65000,
      bhk: 1,
      area: 550,
      city: 'Mumbai',
      locality: 'Bandra',
      address: 'Artist Avenue, Pali Hill, Bandra West, Mumbai 400050',
      lat: 19.0600,
      lng: 72.8271,
      furnishing: 'SEMI',
      amenities: JSON.stringify(['Air Conditioning', 'WiFi', 'Gas Connection']),
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb',
        'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd'
      ]),
      isVerified: true,
      ownerId: owner.id
    },
    {
      title: 'Green Leaf Row House',
      description: 'Beautiful 3-bedroom row house with a private backyard. Sustainable design featuring solar panels and rainwater harvesting. Located in the peaceful Kothrud area.',
      type: 'BUY',
      category: 'HOUSE',
      price: 22000000,
      bhk: 3,
      area: 2200,
      city: 'Pune',
      locality: 'Kothrud',
      address: 'Green Leaf Residency, Chandani Chowk, Kothrud, Pune 411038',
      lat: 18.5074,
      lng: 73.8077,
      furnishing: 'SEMI',
      amenities: JSON.stringify(['Solar Power', 'Backyard', 'Rainwater Harvesting', 'Parking']),
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1518780664697-55e3ad937233',
        'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf'
      ]),
      isVerified: true,
      ownerId: owner.id
    },
    {
      title: 'Tech Heritage PG for Women',
      description: 'Premium PG accommodation for women working in Whitefield. Includes healthy meals, housekeeping, and vibrant common areas.',
      type: 'RENT',
      category: 'PG',
      price: 18000,
      bhk: null,
      area: 300,
      city: 'Bangalore',
      locality: 'Whitefield',
      address: 'Tech Heritage, ITPL Main Road, Whitefield, Bangalore 560066',
      lat: 12.9698,
      lng: 77.7499,
      furnishing: 'FULLY',
      amenities: JSON.stringify(['Meals Included', 'Housekeeping', 'WiFi', 'Laundry']),
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1555854817-5b2738a75574',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf'
      ]),
      isVerified: true,
      ownerId: owner.id
    },
    {
      title: 'Modern Office Space in Andheri',
      description: 'Premium commercial space ready to move in. Includes dedicated cabins, conference room, and high-speed elevators. Strategically located near the Metro station.',
      type: 'RENT',
      category: 'COMMERCIAL',
      price: 300000,
      bhk: null,
      area: 2500,
      city: 'Mumbai',
      locality: 'Andheri',
      address: 'Metro Corporate Park, Andheri East, Mumbai 400069',
      lat: 19.1136,
      lng: 72.8697,
      furnishing: 'FULLY',
      amenities: JSON.stringify(['Conference Room', 'AC', 'Power Backup', 'Security', 'Reception']),
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1497366216548-37526070297c',
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2'
      ]),
      isVerified: true,
      ownerId: owner.id
    },
    {
      title: 'Residential Plot in North Delhi',
      description: 'Corner plot in a developing residential zone. Clear title and approved for high-rise construction. Great investment opportunity.',
      type: 'BUY',
      category: 'PLOT',
      price: 45000000,
      bhk: null,
      area: 3600,
      city: 'Delhi',
      locality: 'Rohini',
      address: 'Sector 24, Rohini, Delhi 110085',
      lat: 28.7161,
      lng: 77.0863,
      furnishing: 'UNFURNISHED',
      amenities: JSON.stringify(['Corner Plot', 'Road Facing', 'Gated Community']),
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef',
        'https://images.unsplash.com/photo-1449156001437-3a164bcaad36'
      ]),
      isVerified: true,
      ownerId: owner.id
    },
    {
      title: 'Garden View 2BHK in Dwarka',
      description: 'Spacious 2BHK with wrap-around balconies. Facing a large public garden. Well-ventilated and close to markets and schools.',
      type: 'BUY',
      category: 'FLAT',
      price: 12500000,
      bhk: 2,
      area: 1200,
      city: 'Delhi',
      locality: 'Dwarka',
      address: 'Garden View Apartments, Sector 10, Dwarka, Delhi 110075',
      lat: 28.5878,
      lng: 77.0652,
      furnishing: 'SEMI',
      amenities: JSON.stringify(['Park Facing', 'Parking', 'Gas Pipeline', 'Lift']),
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1484154218962-a197022b5858',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858'
      ]),
      isVerified: true,
      ownerId: owner.id
    }
  ];

  const listingsCreated = [];
  for (const l of listings) {
    const listing = await prisma.listing.create({ data: l });
    listingsCreated.push(listing);
  }

  // Add some reviews
  const reviewers = [
    { name: 'Amit Sharma', email: 'amit@example.com' },
    { name: 'Priya Patel', email: 'priya@example.com' },
    { name: 'Vikram Singh', email: 'vikram@example.com' }
  ];

  for (const r of reviewers) {
    const user = await prisma.user.create({
      data: {
        ...r,
        password,
        role: 'BUYER'
      }
    });

    // Add a review for the first listing
    await prisma.review.create({
      data: {
        rating: 5,
        comment: `Absolutely loved this property! The ${listingsCreated[0].title} is even better in person.`,
        userId: user.id,
        listingId: listingsCreated[0].id
      }
    });

    // Add a review for a random listing
    const randomListing = listingsCreated[Math.floor(Math.random() * listingsCreated.length)];
    await prisma.review.create({
      data: {
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5
        comment: `Great experience viewing this place. Very professional owner and a beautiful ${randomListing.category.toLowerCase()}.`,
        userId: user.id,
        listingId: randomListing.id
      }
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
