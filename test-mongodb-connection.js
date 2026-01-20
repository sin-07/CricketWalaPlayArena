require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function testMongoDBConnection() {
  try {
    // 1. Read MONGODB_URI from process.env
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    // 2. Log the URI host (without password)
    const sanitizedUri = mongoUri.replace(/:([^:@]+)@/, ':****@');
    console.log('🔗 Connecting to:', sanitizedUri);
    
    // 3. Attempt mongoose.connect with mongodb+srv
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    // 4. Log "SRV connection successful" on success
    console.log('✅ SRV connection successful');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📁 Collections found: ${collections.length}`);
    if (collections.length > 0) {
      console.log('   -', collections.map(c => c.name).join(', '));
    }

  } catch (error) {
    // 5. Log detailed error on failure
    console.error('❌ Connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.reason) {
      console.error('Reason:', error.reason);
    }
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  } finally {
    // 6. Exit the process cleanly
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 Connection closed');
    }
    process.exit(0);
  }
}

// Run the test
testMongoDBConnection();
