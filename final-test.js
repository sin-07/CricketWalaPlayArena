require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const dns2 = require('dns2');

async function test() {
  const uri = process.env.MONGODB_URI;
  
  console.log('Connecting with +srv (bypassing DNS issue)...');
  
  // Manual DNS query using dns2
  const resolver = dns2({ dns: '8.8.8.8' });
  
  try {
    const result = await resolver.query('_mongodb._tcp.cluster0.2rttseq.mongodb.net', 'SRV');
    console.log('SUCCESS: DNS resolved:', result.answers.length, 'servers');
    
    // Now connect
    const client = new MongoClient(uri);
    await client.connect();
    console.log('SUCCESS: Connected!');
    const db = client.db();
    console.log('Database:', db.databaseName);
    await client.close();
  } catch (error) {
    console.log('ERROR:', error.message);
  }
}

test();
