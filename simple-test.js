require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

// Simple MongoDB connection (no +srv, direct hosts)
const uri = 'mongodb://aniketsingh9322_db_user:qC6O9yyyhHCbf0hR@ac-rwzhqr9-shard-00-00.2rttseq.mongodb.net:27017,ac-rwzhqr9-shard-00-01.2rttseq.mongodb.net:27017,ac-rwzhqr9-shard-00-02.2rttseq.mongodb.net:27017/CWPA?ssl=true&replicaSet=atlas-u3q1ps-shard-0&authSource=admin';

async function test() {
  console.log('Connecting...');
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('SUCCESS: Connected!');
    const db = client.db();
    console.log('Database:', db.databaseName);
    const cols = await db.listCollections().toArray();
    console.log('Collections:', cols.map(c => c.name).join(', ') || 'none');
  } catch (e) {
    console.log('ERROR:', e.message);
  } finally {
    await client.close();
  }
}

test();
