require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

// Force Node.js to use system DNS resolver
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

async function test() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.log('❌ No MONGODB_URI');
    return;
  }

  console.log('🔗 Connecting...');
  const client = new MongoClient(uri, {
    family: 4  // Force IPv4
  });
  
  try {
    await client.connect();
    console.log('✅ Connected!');
    
    const db = client.db();
    console.log('📊 Database:', db.databaseName);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

test();
