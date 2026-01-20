// Direct admin insertion into MongoDB
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');

// Set DNS resolver fallback
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoUri = 'mongodb+srv://aniketsingh9322_db_user:qC6O9yyyhHCbf0hR@cluster0.2rttseq.mongodb.net/CWPA?retryWrites=true&w=majority&appName=Cluster0';

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
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existing = await Admin.findOne({ username: 'rahul' });
    if (existing) {
      console.log('⚠️  Admin user "rahul" already exists');
      await mongoose.connection.close();
      return;
    }

    // Hash the password manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Rahul@123', salt);

    // Create admin with hashed password
    const admin = await Admin.create({
      username: 'Rahul',
      password: hashedPassword,
    });

    console.log('✅ Admin inserted successfully!');
    console.log('Username:', admin.username);
    console.log('Password: Rahul@123 (stored as hashed)');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
  }
}

insertAdmin();
