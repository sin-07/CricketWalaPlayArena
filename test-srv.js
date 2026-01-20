require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const dns = require('dns').promises;

async function test() {
  const uri = process.env.MONGODB_URI;
  
  console.log('Testing SRV connection with +srv...');
  
  // Try to manually resolve SRV first
  try {
    const records = await dns.resolveSrv('_mongodb._tcp.cluster0.2rttseq.mongodb.net');
    console.log('SUCCESS: DNS SRV resolution works:', records.length, 'servers found');
  } catch (e) {
    console.log('WARNING: DNS SRV resolution failed:', e.message);
    console.log('Try: netsh interface ipv4 set dns "Wi-Fi" static 8.8.8.8');
    return;
  }
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000
  });
  
  try {
    await client.connect();
    console.log('SUCCESS: Connected with +srv!');
    const db = client.db();
    console.log('Database:', db.databaseName);
  } catch (error) {
    console.log('ERROR: Connection error:', error.message);
  } finally {
    await client.close();
  }
}

test();
