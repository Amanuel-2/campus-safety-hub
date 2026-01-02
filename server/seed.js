const mongoose = require('mongoose');
require('dotenv').config();

const Admin = require('./models/Admin');
const Incident = require('./models/Incident');
const LostItem = require('./models/LostItem');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_safety_hub';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    await Admin.deleteMany({});
    await Incident.deleteMany({});
    await LostItem.deleteMany({});
    console.log('✓ Cleared existing data');

    // Create default admin
    const admin = new Admin({
      username: 'admin',
      password: 'admin123',
      name: 'System Administrator',
      role: 'superadmin',
    });
    await admin.save();
    console.log('✓ Created default admin (username: admin, password: admin123)');

    // Create sample incidents
    const incidents = [
      {
        title: 'Suspicious person near library',
        description: 'An unidentified individual was seen loitering near the library entrance for an extended period. They appeared to be watching students entering and exiting the building.',
        type: 'suspicious_activity',
        severity: 'medium',
        status: 'investigating',
        location: { lat: 9.0310, lng: 38.7640 },
        locationDescription: 'Main Library Entrance',
        anonymous: true,
      },
      {
        title: 'Broken window in Science Building',
        description: 'A window on the second floor of the Science Building was found broken this morning. Glass fragments were found on the ground below.',
        type: 'vandalism',
        severity: 'low',
        status: 'pending',
        location: { lat: 9.0295, lng: 38.7620 },
        locationDescription: 'Science Building, 2nd Floor East Wing',
        anonymous: false,
        reporterName: 'John Smith',
        reporterContact: 'john.smith@campus.edu',
      },
      {
        title: 'Car break-in in parking lot',
        description: 'My car window was smashed and laptop was stolen from the back seat. This happened sometime between 2 PM and 5 PM today.',
        type: 'theft',
        severity: 'high',
        status: 'investigating',
        location: { lat: 9.0285, lng: 38.7650 },
        locationDescription: 'Student Parking Lot B',
        anonymous: false,
        reporterName: 'Sarah Johnson',
        reporterContact: 'sarah.j@campus.edu',
      },
      {
        title: 'Fire alarm malfunction',
        description: 'The fire alarm in the dormitory building went off without any apparent cause. False alarm but caused significant disruption.',
        type: 'emergency',
        severity: 'medium',
        status: 'resolved',
        location: { lat: 9.0320, lng: 38.7615 },
        locationDescription: 'North Dormitory Building',
        anonymous: true,
      },
    ];

    await Incident.insertMany(incidents);
    console.log(`✓ Created ${incidents.length} sample incidents`);

    // Create sample lost items
    const lostItems = [
      {
        title: 'Black iPhone 15 Pro',
        description: 'Black iPhone 15 Pro with a cracked screen protector. Has a dark blue case with a card holder on the back.',
        category: 'electronics',
        status: 'lost',
        location: { lat: 9.0305, lng: 38.7638 },
        locationDescription: 'Cafeteria or Library',
        dateOccurred: new Date('2026-01-01'),
        contactName: 'Michael Brown',
        contactEmail: 'michael.b@campus.edu',
        contactPhone: '+1234567890',
      },
      {
        title: 'Blue North Face Backpack',
        description: 'Navy blue North Face backpack containing textbooks and a calculator. Has a keychain with a small teddy bear.',
        category: 'bags',
        status: 'found',
        location: { lat: 9.0298, lng: 38.7625 },
        locationDescription: 'Found near Student Center',
        dateOccurred: new Date('2026-01-02'),
        contactName: 'Campus Security',
        contactEmail: 'security@campus.edu',
      },
      {
        title: 'Student ID Card - Emma Wilson',
        description: 'Student ID card belonging to Emma Wilson, Computer Science department. Card number ends in 4521.',
        category: 'documents',
        status: 'found',
        location: { lat: 9.0312, lng: 38.7632 },
        locationDescription: 'Registrar Office',
        dateOccurred: new Date('2025-12-30'),
        contactName: 'Registrar Office',
        contactEmail: 'registrar@campus.edu',
      },
      {
        title: 'Car Keys with BMW fob',
        description: 'Set of car keys with a BMW key fob and a house key. Has a small orange lanyard attached.',
        category: 'keys',
        status: 'lost',
        location: { lat: 9.0290, lng: 38.7645 },
        locationDescription: 'Gym or Swimming Pool area',
        dateOccurred: new Date('2026-01-02'),
        contactName: 'David Lee',
        contactEmail: 'david.lee@campus.edu',
      },
    ];

    await LostItem.insertMany(lostItems);
    console.log(`✓ Created ${lostItems.length} sample lost/found items`);

    console.log('\n✓ Database seeded successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();

