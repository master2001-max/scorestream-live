const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const House = require('../models/House');
const Match = require('../models/Match');
const Announcement = require('../models/Announcement');

const seedData = async () => {
  try {
    console.log('🌱 Starting data seeding...');

    // Clear existing data
    await User.deleteMany({});
    await House.deleteMany({});
    await Match.deleteMany({});
    await Announcement.deleteMany({});

    console.log('🗑️ Cleared existing data');

    // Create houses
    const houses = await House.insertMany([
      {
        name: 'Red House',
        color: '#FF0000',
        motto: 'Strength and Courage',
        description: 'The house of champions',
        totalScore: 0
      },
      {
        name: 'Blue House',
        color: '#0000FF',
        motto: 'Wisdom and Loyalty',
        description: 'The house of excellence',
        totalScore: 0
      },
      {
        name: 'Green House',
        color: '#00FF00',
        motto: 'Growth and Harmony',
        description: 'The house of unity',
        totalScore: 0
      },
      {
        name: 'Yellow House',
        color: '#FFFF00',
        motto: 'Joy and Innovation',
        description: 'The house of creativity',
        totalScore: 0
      }
    ]);

    console.log('🏠 Created houses');

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = await User.insertMany([
      // Admin
      {
        name: 'Admin User',
        email: 'admin@sportmeet.com',
        password: hashedPassword,
        role: 'admin',
        house: null
      },
      // Score Uploader
      {
        name: 'Score Manager',
        email: 'score@sportmeet.com',
        password: hashedPassword,
        role: 'score_uploader',
        house: null
      },
      // House Captains
      {
        name: 'Red Captain',
        email: 'red.captain@sportmeet.com',
        password: hashedPassword,
        role: 'captain',
        house: houses[0]._id
      },
      {
        name: 'Blue Captain',
        email: 'blue.captain@sportmeet.com',
        password: hashedPassword,
        role: 'captain',
        house: houses[1]._id
      },
      {
        name: 'Green Captain',
        email: 'green.captain@sportmeet.com',
        password: hashedPassword,
        role: 'captain',
        house: houses[2]._id
      },
      {
        name: 'Yellow Captain',
        email: 'yellow.captain@sportmeet.com',
        password: hashedPassword,
        role: 'captain',
        house: houses[3]._id
      },
      // Students
      {
        name: 'John Smith',
        email: 'john@sportmeet.com',
        password: hashedPassword,
        role: 'student',
        house: houses[0]._id
      },
      {
        name: 'Jane Doe',
        email: 'jane@sportmeet.com',
        password: hashedPassword,
        role: 'student',
        house: houses[1]._id
      },
      {
        name: 'Mike Johnson',
        email: 'mike@sportmeet.com',
        password: hashedPassword,
        role: 'student',
        house: houses[2]._id
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah@sportmeet.com',
        password: hashedPassword,
        role: 'student',
        house: houses[3]._id
      }
    ]);

    console.log('👥 Created users');

    // Update houses with captains
    await House.findByIdAndUpdate(houses[0]._id, { captain: users[2]._id });
    await House.findByIdAndUpdate(houses[1]._id, { captain: users[3]._id });
    await House.findByIdAndUpdate(houses[2]._id, { captain: users[4]._id });
    await House.findByIdAndUpdate(houses[3]._id, { captain: users[5]._id });

    console.log('👑 Assigned captains to houses');

    // Create sample matches
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const matches = await Match.insertMany([
      {
        house1: houses[0]._id,
        house2: houses[1]._id,
        sport: 'Football',
        matchTime: tomorrow,
        status: 'upcoming',
        description: 'Championship Final',
        venue: 'Main Field',
        createdBy: users[1]._id
      },
      {
        house1: houses[2]._id,
        house2: houses[3]._id,
        sport: 'Basketball',
        matchTime: dayAfter,
        status: 'upcoming',
        description: 'Semi-Final',
        venue: 'Basketball Court',
        createdBy: users[1]._id
      },
      {
        house1: houses[0]._id,
        house2: houses[2]._id,
        sport: 'Cricket',
        matchTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: 'finished',
        score1: 150,
        score2: 120,
        winner: houses[0]._id,
        finishedAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
        description: 'Group Stage Match',
        venue: 'Cricket Ground',
        createdBy: users[1]._id
      },
      {
        house1: houses[1]._id,
        house2: houses[3]._id,
        sport: 'Volleyball',
        matchTime: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
        status: 'live',
        score1: 2,
        score2: 1,
        description: 'Live Match',
        venue: 'Volleyball Court',
        createdBy: users[1]._id
      }
    ]);

    console.log('⚽ Created sample matches');

    // Update house scores based on finished matches
    await House.findByIdAndUpdate(houses[0]._id, { totalScore: 10 });

    // Create sample announcements
    await Announcement.insertMany([
      {
        title: 'Welcome to Sport Meet 2024!',
        message: 'Welcome everyone to the annual Sport Meet 2024. Let the games begin and may the best house win!',
        priority: 'high',
        createdBy: users[0]._id, // Admin
        isActive: true
      },
      {
        title: 'Match Schedule Update',
        message: 'The football final has been moved to 3 PM tomorrow due to weather conditions.',
        priority: 'urgent',
        createdBy: users[1]._id, // Score Uploader
        isActive: true
      },
      {
        title: 'Red House Team Meeting',
        message: 'All Red House members, please gather at the main field at 2 PM for our team strategy meeting.',
        priority: 'medium',
        createdBy: users[2]._id, // Red Captain
        house: houses[0]._id,
        isActive: true
      },
      {
        title: 'Blue House Victory!',
        message: 'Congratulations to Blue House for their excellent performance in the volleyball match!',
        priority: 'low',
        createdBy: users[3]._id, // Blue Captain
        house: houses[1]._id,
        isActive: true
      }
    ]);

    console.log('📢 Created sample announcements');

    console.log('✅ Data seeding completed successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('Admin: admin@sportmeet.com / password123');
    console.log('Score Uploader: score@sportmeet.com / password123');
    console.log('Red Captain: red.captain@sportmeet.com / password123');
    console.log('Blue Captain: blue.captain@sportmeet.com / password123');
    console.log('Green Captain: green.captain@sportmeet.com / password123');
    console.log('Yellow Captain: yellow.captain@sportmeet.com / password123');
    console.log('Students: john@sportmeet.com, jane@sportmeet.com, mike@sportmeet.com, sarah@sportmeet.com / password123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
};

module.exports = seedData;

