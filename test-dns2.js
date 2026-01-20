require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const dns2 = require('dns2');

async function test() {
  const uri = process.env.MONGODB_URI;
  
  console.log('Connecting with +srv...');
  
  // Override Node DNS with dns2 (uses UDP directly to 8.8.8.8)
  const { UDPClient } = dns2;
  const resolver = new UDPClient({ dns: '8.8.8.8' });
  const originalResolveSrv = require('dns').resolveSrv;
  
  require('dns').resolveSrv = async (hostname, callback) => {
    try {
      const result = await resolver.resolve(hostname, 'SRV');
      const records = result.answers.map(a => ({
        name: a.data.target,
        port: a.data.port,
        priority: a.data.priority,
        weight: a.data.weight
      }));
      callback(null, records);
    } catch (e) {
      callback(e);
    }
  };
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('SUCCESS: Connected with +srv!');
    const db = client.db();
    console.log('Database:', db.databaseName);
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name).join(', ') || 'none');
  } catch (error) {
    console.log('ERROR:', error.message);
  } finally {
    await client.close();
  }
}

test();
