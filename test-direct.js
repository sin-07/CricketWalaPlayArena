require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function test() {
  // Manual SRV resolution workaround
  const hosts = [
    'ac-rwzhqr9-shard-00-00.2rttseq.mongodb.net:27017',
    'ac-rwzhqr9-shard-00-01.2rttseq.mongodb.net:27017', 
    'ac-rwzhqr9-shard-00-02.2rttseq.mongodb.net:27017'
  ];
  
  const username = encodeURIComponent('aniketsingh9322_db_user');
  const password = encodeURIComponent('qC6O9yyyhHCbf0hR');
  const dbName = 'CWPA';
  
  const uri = `mongodb://${username}:${password}@${hosts.join(',')}/${dbName}?ssl=true&replicaSet=atlas-u3q1ps-shard-0&authSource=admin&retryWrites=true&w=majority`;
  
  console.log('🔗 Connecting (direct, bypassing SRV)...');
  const client = new MongoClient(uri);
  
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
