// Direct admin insertion into MongoDB
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');

// Force Node.js to prefer IPv4 for DNS resolution
dns.setDefaultResultOrder('ipv4first');

const mongoUri = 'mongodb+srv://aniketsingh9322_db_user:UKxrEtvM1KDGiUSG@cluster0.trpgklj.mongodb.net/CricketBox?retryWrites=true&w=majority&appName=Cluster0';

// Admin schema definition
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Admin = mongoose.model('Admin', adminSchema);

async function insertAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('SUCCESS: Connected to MongoDB');

    // Check if admin already exists
    const existing = await Admin.findOne({ username: 'rahul' });
    if (existing) {
      console.log('WARNING: Admin user "rahul" already exists');
      await mongoose.connection.close();
      return;
    }

    // Hash the password manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Rahul@123', salt);

    // Create admin with hashed password
    const admin = await Admin.create({
      username: 'rahul',
      password: hashedPassword,
    });

    console.log('SUCCESS: Admin inserted successfully!');
    console.log('Username:', admin.username);
    console.log('Password: Rahul@123 (stored as hashed)');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('ERROR:', error.message);
    await mongoose.connection.close();
  }
}

insertAdmin();
