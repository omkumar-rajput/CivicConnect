// Database seeder script to populate initial categories, demo accounts, and sample grievances
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Category = require('./models/Category');
const Complaint = require('./models/Complaint');

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civicconnect';

const seedData = async () => {
  try {
    console.log('[Seeder] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('[Seeder] Connected! Clearing old records...');

    await User.deleteMany();
    await Category.deleteMany();
    await Complaint.deleteMany();

    console.log('[Seeder] Inserting Categories...');
    const categories = await Category.insertMany([
      {
        name: 'Roads & Potholes',
        department: 'Roads & Infrastructure',
        description: 'Damaged roads, dangerous potholes, broken dividers and pavements.',
        icon: 'bi-cone-striped',
      },
      {
        name: 'Garbage & Solid Waste',
        department: 'Sanitation & Solid Waste Management',
        description: 'Uncollected waste, overflowing garbage bins, illegal dumping sites.',
        icon: 'bi-trash3',
      },
      {
        name: 'Water Supply & Leakages',
        department: 'Water Supply & Sewerage Board',
        description: 'Broken water pipelines, contaminated water supply, low water pressure.',
        icon: 'bi-droplet-half',
      },
      {
        name: 'Streetlights & Electrical',
        department: 'Electricity & Streetlighting Cell',
        description: 'Non-functional streetlights, exposed live wires, broken lamp posts.',
        icon: 'bi-lightbulb',
      },
      {
        name: 'Drainage & Sewage',
        department: 'Drainage & Stormwater Department',
        description: 'Blocked stormwater drains, overflowing manholes, stagnant sewage.',
        icon: 'bi-water',
      },
      {
        name: 'Public Parks & Amenities',
        department: 'Horticulture & Parks Dept',
        description: 'Broken benches, playground equipment damage, unmaintained public parks.',
        icon: 'bi-tree',
      },
    ]);

    console.log('[Seeder] Creating Accounts (Admin, Officers, Citizens)...');
    
    // Create Admin
    const admin = await User.create({
      name: 'Municipal Administrator',
      email: 'admin@civicconnect.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 98765 00001',
    });

    // Create Officers
    const officerRoads = await User.create({
      name: 'Rajesh Sharma (JE Roads)',
      email: 'officer.roads@civicconnect.com',
      password: 'officer123',
      role: 'officer',
      department: 'Roads & Infrastructure',
      phone: '+91 98765 00002',
    });

    const officerSanitation = await User.create({
      name: 'Sunita Verma (Sanitary Inspector)',
      email: 'officer.sanitation@civicconnect.com',
      password: 'officer123',
      role: 'officer',
      department: 'Sanitation & Solid Waste Management',
      phone: '+91 98765 00003',
    });

    // Create Citizen
    const citizen = await User.create({
      name: 'Amit Patel',
      email: 'citizen@example.com',
      password: 'citizen123',
      role: 'citizen',
      phone: '+91 98765 11111',
    });

    console.log('[Seeder] Adding Sample Grievance Complaints...');
    await Complaint.create([
      {
        complaintId: 'CC-1001',
        title: 'Deep pothole near Metro Station Gate 2',
        description: 'A dangerous deep pothole has developed right outside the metro station exit. Two-wheeler riders are skidding and having near misses during evening rush hours.',
        category: 'Roads & Potholes',
        location: {
          address: 'Station Road, Sector 18',
          landmark: 'Opposite Metro Station Gate 2',
          city: 'New Delhi',
          pincode: '110001',
        },
        imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800',
        priority: 'High',
        status: 'In Progress',
        citizen: citizen._id,
        assignedOfficer: officerRoads._id,
        statusHistory: [
          {
            status: 'Submitted',
            remarks: 'Complaint lodged by citizen',
            updatedBy: citizen._id,
            updatedByName: citizen.name,
            updatedAt: new Date(Date.now() - 3 * 86400000),
          },
          {
            status: 'Assigned',
            remarks: 'Assigned to Officer Rajesh Sharma for on-site inspection.',
            updatedBy: admin._id,
            updatedByName: admin.name,
            updatedAt: new Date(Date.now() - 2 * 86400000),
          },
          {
            status: 'In Progress',
            remarks: 'Road repair team dispatched with asphalt mixture for patch-work.',
            updatedBy: officerRoads._id,
            updatedByName: officerRoads.name,
            updatedAt: new Date(Date.now() - 1 * 86400000),
          },
        ],
      },
      {
        complaintId: 'CC-1002',
        title: 'Overflowing community garbage bin not cleared for 4 days',
        description: 'Community garbage dumpster is completely full and trash is spilling onto the street. Foul smell is spreading and stray animals are scattering waste.',
        category: 'Garbage & Solid Waste',
        location: {
          address: 'Block C Market, Main Avenue',
          landmark: 'Behind Community Center',
          city: 'New Delhi',
          pincode: '110024',
        },
        imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800',
        priority: 'Urgent',
        status: 'Assigned',
        citizen: citizen._id,
        assignedOfficer: officerSanitation._id,
        statusHistory: [
          {
            status: 'Submitted',
            remarks: 'Complaint lodged by citizen',
            updatedBy: citizen._id,
            updatedByName: citizen.name,
            updatedAt: new Date(Date.now() - 24 * 3600000),
          },
          {
            status: 'Assigned',
            remarks: 'Assigned to Sanitary Inspector Sunita Verma.',
            updatedBy: admin._id,
            updatedByName: admin.name,
            updatedAt: new Date(Date.now() - 12 * 3600000),
          },
        ],
      },
      {
        complaintId: 'CC-1003',
        title: 'Broken streetlight causing darkness on residential lane',
        description: 'The pole lamp post has been dark for the past two weeks. The lane is pitch dark at night, causing safety concerns for women and elderly residents.',
        category: 'Streetlights & Electrical',
        location: {
          address: 'Lane 4, Pocket B',
          landmark: 'Near Pole No. 42',
          city: 'New Delhi',
          pincode: '110048',
        },
        imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800',
        priority: 'Medium',
        status: 'Resolved',
        citizen: citizen._id,
        assignedOfficer: officerRoads._id,
        resolutionRemarks: 'LED bulb fixture and fuse replaced. Light tested and verified functional.',
        resolvedAt: new Date(Date.now() - 6 * 3600000),
        statusHistory: [
          {
            status: 'Submitted',
            remarks: 'Complaint lodged by citizen',
            updatedBy: citizen._id,
            updatedByName: citizen.name,
            updatedAt: new Date(Date.now() - 5 * 86400000),
          },
          {
            status: 'Assigned',
            remarks: 'Assigned to electrical team',
            updatedBy: admin._id,
            updatedByName: admin.name,
            updatedAt: new Date(Date.now() - 4 * 86400000),
          },
          {
            status: 'In Progress',
            remarks: 'Electrician assigned for fixture replacement',
            updatedBy: officerRoads._id,
            updatedByName: officerRoads.name,
            updatedAt: new Date(Date.now() - 2 * 86400000),
          },
          {
            status: 'Resolved',
            remarks: 'LED bulb fixture and fuse replaced. Light tested and verified functional.',
            updatedBy: officerRoads._id,
            updatedByName: officerRoads.name,
            updatedAt: new Date(Date.now() - 6 * 3600000),
          },
        ],
        feedback: {
          rating: 5,
          comment: 'Quick and efficient resolution! The lane is properly illuminated now. Thank you CivicConnect team.',
          submittedAt: new Date(Date.now() - 2 * 3600000),
        },
      },
      {
        complaintId: 'CC-1004',
        title: 'Major freshwater pipeline leakage wasting drinking water',
        description: 'Underground pipeline cracked and continuous high-pressure potable water is gushing onto the sidewalk.',
        category: 'Water Supply & Leakages',
        location: {
          address: 'Main Ring Road near Flyover Pillar 14',
          landmark: 'Flyover Pillar 14',
          city: 'New Delhi',
          pincode: '110029',
        },
        imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800',
        priority: 'Urgent',
        status: 'Submitted',
        citizen: citizen._id,
        statusHistory: [
          {
            status: 'Submitted',
            remarks: 'Freshwater burst reported by citizen',
            updatedBy: citizen._id,
            updatedByName: citizen.name,
            updatedAt: new Date(),
          },
        ],
      },
    ]);

    console.log('========================================================');
    console.log(' SEEDING COMPLETE! DEMO ACCOUNTS READY:');
    console.log('--------------------------------------------------------');
    console.log(' 1. Administrator:');
    console.log('    Email:    admin@civicconnect.com');
    console.log('    Password: admin123');
    console.log('');
    console.log(' 2. Municipal Officers:');
    console.log('    Email:    officer.roads@civicconnect.com');
    console.log('    Password: officer123');
    console.log('    Email:    officer.sanitation@civicconnect.com');
    console.log('    Password: officer123');
    console.log('');
    console.log(' 3. Citizen:');
    console.log('    Email:    citizen@example.com');
    console.log('    Password: citizen123');
    console.log('========================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]', error);
    process.exit(1);
  }
};

seedData();
