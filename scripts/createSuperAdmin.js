// Run this script with: node scripts/createSuperAdmin.js
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

const AdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'superadmin'],
      default: 'admin',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

async function createSuperAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

    // Check if super admin already exists
    const existingAdmin = await Admin.findOne({ username: 'a2r' });
    
    if (existingAdmin) {
      console.log('Super admin already exists!');
      console.log('Username:', existingAdmin.username);
      console.log('Role:', existingAdmin.role);
      
      // Update to superadmin role if needed
      if (existingAdmin.role !== 'superadmin') {
        existingAdmin.role = 'superadmin';
        existingAdmin.isActive = true;
        await existingAdmin.save();
        console.log('✅ Updated existing admin to superadmin role');
      }
    } else {
      // Hash the password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('A2r@2025', salt);

      // Create super admin
      const superAdmin = await Admin.create({
        username: 'A2r',
        password: hashedPassword,
        role: 'superadmin',
        isActive: true,
      });

      console.log('✅ Super Admin created successfully!');
      console.log('Username:', superAdmin.username);
      console.log('Password: A2r@2025');
      console.log('Role:', superAdmin.role);
    }

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    process.exit(1);
  }
}

createSuperAdmin();
