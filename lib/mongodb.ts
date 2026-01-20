import mongoose from 'mongoose';
import dns from 'dns/promises';
import { setServers } from 'dns';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
  // Return existing connection if available
  if (cached!.conn) {
    console.log('♻️ Using existing MongoDB connection');
    return cached!.conn;
  }

  // Create new connection if no promise exists
  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 10000,  // Reduced to 10s for faster failure
      connectTimeoutMS: 10000,           // Reduced to 10s
      socketTimeoutMS: 45000,
      family: 4,                         // Use IPv4, skip trying IPv6
      directConnection: false,           // Allow driver to discover all nodes
      retryWrites: true,
      retryReads: true,
    };

    console.log('🔌 Connecting to MongoDB Atlas...');
    console.log('🔗 URI prefix:', MONGODB_URI?.substring(0, 20) + '...');
    console.log('⚠️  CRITICAL: Ensure your IP is whitelisted in MongoDB Atlas Network Access settings!');
    console.log('📍 Visit: https://cloud.mongodb.com/ → Network Access → Add IP: 0.0.0.0/0');
    
    // Primary attempt: use the provided URI (which may be an SRV URI)
    cached!.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongooseInstance) => {
        console.log('✅ MongoDB connected successfully');
        console.log(`📊 Database: ${mongooseInstance.connection.name}`);
        console.log(`🏠 Host: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      })
      .catch(async (err) => {
        console.error('❌ MongoDB primary connection failed:', err.message);

        // If SRV lookup failed, attempt to resolve SRV records manually and retry with a standard connection string
        if (err.message && err.message.includes('querySrv')) {
            try {
            // Try forcing a reliable DNS resolver for SRV lookups when the
            // platform's configured DNS server refuses queries (ECONNREFUSED).
            try {
              setServers(['8.8.8.8']);
              console.log('🛰️ DNS resolver set to 8.8.8.8 for SRV lookup');
            } catch (dnsErr) {
              // Non-fatal: continue and let dns.resolveSrv attempt using system DNS
              console.warn('⚠️ Could not set DNS servers programmatically:', (dnsErr as any)?.message || dnsErr);
            }

            console.log('🔁 Attempting SRV fallback: resolving SRV records via DNS');
            // Extract host and path/query from the original URI
            let parsed: URL | null = null;
            try {
              parsed = new URL(MONGODB_URI!);
            } catch (e) {
              // Could not parse, rethrow later
              parsed = null;
            }

            const host = parsed ? parsed.hostname : (() => {
              // crude fallback: pull between @ and / or end
              const m = MONGODB_URI!.match(/@([^/]+)/);
              return m ? m[1] : MONGODB_URI!;
            })();

            const srvName = `_mongodb._tcp.${host}`;
            const records = await dns.resolveSrv(srvName);
            if (!records || records.length === 0) throw new Error('No SRV records found');

            const hosts = records.map(r => `${r.name}:${r.port}`);

            // Preserve path (database) and querystring if present
            const pathname = parsed ? parsed.pathname.replace(/^\//, '') : '';
            const search = parsed ? parsed.search : '';

            // Extract auth from parsed URL if available
            const auth = parsed && parsed.username ? `${decodeURIComponent(parsed.username)}${parsed.password ? ':' + decodeURIComponent(parsed.password) : ''}@` : '';

            const standardUri = `mongodb://${auth}${hosts.join(',')}/${pathname || ''}${search}`;
            console.log('🔗 SRV fallback URI:', standardUri.substring(0, 120) + '...');

            // Retry connection with standard URI
            const fallback = await mongoose.connect(standardUri, opts);
            console.log('✅ MongoDB connected via SRV fallback');
            return fallback;
          } catch (fallbackErr: any) {
            console.error('❌ SRV fallback failed:', fallbackErr?.message || fallbackErr);
            cached!.promise = null; // Reset promise on failure
            throw err; // throw original error to preserve context
          }
        }

        console.error('💡 Troubleshooting tips:');
        console.error('   1. Check if your IP is whitelisted in MongoDB Atlas (allow 0.0.0.0/0 for testing)');
        console.error('   2. Verify your MongoDB URI is correct');
        console.error('   3. Check your internet connection/VPN/firewall');
        console.error('   4. As a last resort, use the standard connection string from Atlas (non-SRV)');
        cached!.promise = null; // Reset promise on failure
        throw err;
      });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e: any) {
    cached!.promise = null; // Reset promise on failure
    console.error('❌ MongoDB connection error:', e.message);
    throw new Error(`Database connection failed: ${e.message}`);
  }

  return cached!.conn;
}

export default dbConnect;
