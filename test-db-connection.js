// Quick test for MongoDB connection with DNS fix
const dns = require('dns');
const { promisify } = require('util');
const resolveSrv = promisify(dns.resolveSrv);

// Set DNS servers to Google DNS (helps with Windows DNS issues)
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
console.log('DNS servers set to:', dns.getServers());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://aniketsingh9322_db_user:UKxrEtvM1KDGiUSG@cluster0.trpgklj.mongodb.net/CricketBox?retryWrites=true&w=majority&appName=Cluster0';

async function testConnection() {
  try {
    console.log('\n1. Testing DNS resolution...');
    const srvName = '_mongodb._tcp.cluster0.trpgklj.mongodb.net';
    const records = await resolveSrv(srvName);
    console.log('✓ DNS resolution successful!');
    console.log('   Found', records.length, 'SRV records:');
    records.forEach(r => console.log(`   - ${r.name}:${r.port}`));

    console.log('\n2. Testing MongoDB connection...');
    const mongoose = require('mongoose');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      family: 4,
      tls: true,
    });

    console.log('✓ MongoDB connection successful!');
    console.log('   Database:', mongoose.connection.name);
    console.log('   Host:', mongoose.connection.host);
    
    await mongoose.connection.close();
    console.log('\n✓ All tests passed! Your MongoDB connection is working.');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Connection failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Verify IP is whitelisted in MongoDB Atlas (0.0.0.0/0 for testing)');
    console.error('2. Check if VPN/firewall is blocking the connection');
    console.error('3. Verify MongoDB credentials are correct');
    process.exit(1);
  }
}

testConnection();
