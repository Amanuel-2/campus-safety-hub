#!/usr/bin/env node

/**
 * Database Connection Diagnostic Tool
 * Run this to check if MongoDB is accessible and if admin user exists
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_safety_hub';
const Admin = require('./models/Admin');

async function checkDatabase() {
  console.log('\n🔍 Checking Database Connection...\n');
  console.log(`Connection URI: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}\n`);

  try {
    // Attempt connection
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ Successfully connected to MongoDB!\n');
    
    // Check admin user
    console.log('🔍 Checking for admin user...');
    const admin = await Admin.findOne({ username: 'admin' });
    
    if (admin) {
      console.log('✅ Admin user exists');
      console.log(`   Username: ${admin.username}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Created: ${admin.createdAt}\n`);
    } else {
      console.log('❌ Admin user NOT found!');
      console.log('\n💡 Solution: Run the seed script to create admin user:');
      console.log('   npm run seed\n');
    }
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Collections found: ${collections.length}`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Diagnostic complete!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Database Connection Failed!\n');
    console.error('Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 MongoDB is not running!\n');
      console.error('Solutions:');
      console.error('1. Start MongoDB:');
      console.error('   Linux:   sudo systemctl start mongodb');
      console.error('   macOS:   brew services start mongodb-community');
      console.error('   Windows: Start MongoDB service from Services\n');
      console.error('2. Or use MongoDB Atlas (cloud):');
      console.error('   - Sign up at https://www.mongodb.com/cloud/atlas');
      console.error('   - Update MONGODB_URI in .env file\n');
    } else if (error.message.includes('authentication failed')) {
      console.error('\n💡 Authentication failed. Check your MongoDB credentials.\n');
    } else if (error.message.includes('timeout')) {
      console.error('\n💡 Connection timeout. Check if MongoDB is running and accessible.\n');
    }
    
    process.exit(1);
  }
}

checkDatabase();

