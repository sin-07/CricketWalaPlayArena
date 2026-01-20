// Quick script to add admin via API
const https = require('https');
const http = require('http');

const admin = {
  username: 'rahul',
  password: 'Rahul@123'
};

// Since MongoDB is now connected in the app, use a direct Mongoose connection with proper options
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const mongoUri = 'mongodb+srv://aniketsingh9322_db_user:UKxrEtvM1KDGiUSG@cluster0.trpgklj.mongodb.net/CricketBox?retryWrites=true&w=majority&appName=Cluster0';

// Admin schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Admin = mongoose.model('Admin', adminSchema);

async function addAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    
    // Use same connection options as the app
    await mongoose.connect(mongoUri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existing = await Admin.findOne({ username: 'rahul' });
    if (existing) {
      console.log('⚠️  Admin user "rahul" already exists');
      await mongoose.connection.close();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Rahul@123', salt);

    // Create admin
    await Admin.create({
      username: 'rahul',
      password: hashedPassword,
    });

    console.log('✅ Admin created successfully!');
    console.log('Username: rahul');
    console.log('Password: Rahul@123');
    
    await mongoose.connection.close();
    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

addAdmin();
