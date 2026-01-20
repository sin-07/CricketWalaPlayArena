// Test with standard MongoDB connection string (non-SRV)
const mongoose = require('mongoose');

// Based on the SRV records we found: ac-wqpnywl-shard-00-00, 00-01, 00-02
const STANDARD_URI = 'mongodb://aniketsingh9322_db_user:UKxrEtvM1KDGiUSG@ac-wqpnywl-shard-00-00.trpgklj.mongodb.net:27017,ac-wqpnywl-shard-00-01.trpgklj.mongodb.net:27017,ac-wqpnywl-shard-00-02.trpgklj.mongodb.net:27017/CricketBox?retryWrites=true&w=majority&authSource=admin&replicaSet=atlas-jnegc2-shard-0&tls=true';

async function testStandardConnection() {
  try {
    console.log('Testing standard MongoDB connection (non-SRV)...');
    
    await mongoose.connect(STANDARD_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      family: 4,
    });

    console.log('✓ MongoDB connection successful!');
    console.log('   Database:', mongoose.connection.name);
    console.log('   Host:', mongoose.connection.host);
    
    await mongoose.connection.close();
    console.log('\n✓ Standard connection works! Use this format in your .env.local');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Connection failed:', error.message);
    console.error('\nThis means there might be a network/firewall issue or IP not whitelisted.');
    process.exit(1);
  }
}

testStandardConnection();
