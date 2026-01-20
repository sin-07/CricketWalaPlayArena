const { Resolver } = require('dns').promises;
const mongoose = require('mongoose');

async function testWithCustomResolver() {
  try {
    // Create custom resolver with Google DNS
    const resolver = new Resolver();
    resolver.setServers(['8.8.8.8', '1.1.1.1']);
    
    console.log('1. Testing SRV resolution with custom resolver...');
    const srvRecords = await resolver.resolveSrv('_mongodb._tcp.cluster0.trpgklj.mongodb.net');
    
    console.log('✓ SRV resolution successful!');
    console.log('   Found', srvRecords.length, 'records:');
    srvRecords.forEach(r => console.log(`   - ${r.name}:${r.port}`));

    // Build standard connection string from SRV records
    const hosts = srvRecords.map(r => `${r.name}:${r.port}`).join(',');
    const username = 'aniketsingh9322_db_user';
    const password = 'UKxrEtvM1KDGiUSG';
    const database = 'CricketBox';
    
    const standardUri = `mongodb://${username}:${password}@${hosts}/${database}?retryWrites=true&w=majority&authSource=admin&tls=true`;
    
    console.log('\n2. Testing MongoDB connection...');
    await mongoose.connect(standardUri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      family: 4,
    });

    console.log('✓ MongoDB connection successful!');
    console.log('   Database:', mongoose.connection.name);
    
    await mongoose.connection.close();
    console.log('\n✓ SUCCESS! Connection works with custom DNS resolver.');
    console.log('\nYou can use this standard URI in .env.local:');
    console.log(standardUri.replace(password, '****'));
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\nThis is a Windows DNS resolver issue.');
      console.error('Solutions:');
      console.error('1. Check Windows Firewall settings');
      console.error('2. Disable VPN temporarily');
      console.error('3. Use the standard MongoDB URI format instead of SRV');
      console.error('4. Check antivirus software (might block DNS queries)');
    }
    
    process.exit(1);
  }
}

testWithCustomResolver();
