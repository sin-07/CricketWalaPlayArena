import mongoose from 'mongoose';
import { Resolver } from 'dns/promises';

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
    console.log('Using existing MongoDB connection');
    return cached!.conn;
  }

  // Create new connection if no promise exists
  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,             // Close idle connections after 30s
      serverSelectionTimeoutMS: 15000,  // Increased for Windows DNS issues
      connectTimeoutMS: 15000,           // Increased for Windows DNS issues
      socketTimeoutMS: 45000,
      family: 4,                         // Use IPv4, skip trying IPv6
      directConnection: false,           // Allow driver to discover all nodes
      retryWrites: true,
      retryReads: true,
      tls: true,                        // Explicitly enable TLS
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
    };

    console.log('Connecting to MongoDB Atlas...');
    console.log('URI prefix:', MONGODB_URI?.substring(0, 20) + '...');
    console.log('CRITICAL: Ensure your IP is whitelisted in MongoDB Atlas Network Access settings!');
    console.log('Visit: https://cloud.mongodb.com/ → Network Access → Add IP: 0.0.0.0/0');
    
    // Primary attempt: use the provided URI (which may be an SRV URI)
    cached!.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongooseInstance) => {
        console.log('SUCCESS: MongoDB connected successfully');
        console.log(`Database: ${mongooseInstance.connection.name}`);
        console.log(`Host: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      })
      .catch(async (err) => {
        console.error('ERROR: MongoDB primary connection failed:', err.message);

        // If SRV lookup failed, attempt to resolve SRV records manually and retry with a standard connection string
        if (err.message && err.message.includes('querySrv')) {
            try {
            console.log('Attempting SRV fallback: resolving SRV records via custom DNS resolver');
            
            // Create custom resolver with reliable DNS servers (fixes Windows DNS issues)
            const resolver = new Resolver();
            resolver.setServers(['8.8.8.8', '1.1.1.1', '208.67.222.222']);
            
            // Extract host from the original URI
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
            console.log('Resolving SRV:', srvName);
            const records = await resolver.resolveSrv(srvName);
            if (!records || records.length === 0) throw new Error('No SRV records found');
            
            console.log(`Found ${records.length} SRV records:`, records.map(r => `${r.name}:${r.port}`).join(', '));

            const hosts = records.map(r => `${r.name}:${r.port}`);

            // Preserve path (database) and querystring if present
            const pathname = parsed ? parsed.pathname.replace(/^\//, '') : '';
            const searchParams = new URLSearchParams(parsed ? parsed.search : '');
            
            // Ensure authSource=admin for Atlas connections
            if (!searchParams.has('authSource')) {
              searchParams.set('authSource', 'admin');
            }
            
            // Ensure TLS is enabled for Atlas
            if (!searchParams.has('tls') && !searchParams.has('ssl')) {
              searchParams.set('tls', 'true');
            }
            
            const search = searchParams.toString() ? `?${searchParams.toString()}` : '';

            // Extract auth from parsed URL if available
            const auth = parsed && parsed.username ? `${decodeURIComponent(parsed.username)}${parsed.password ? ':' + decodeURIComponent(parsed.password) : ''}@` : '';

            const standardUri = `mongodb://${auth}${hosts.join(',')}/${pathname || ''}${search}`;
            console.log('SRV fallback URI (hosts):', hosts.join(', '));

            // Retry connection with standard URI
            const fallback = await mongoose.connect(standardUri, opts);
            console.log('SUCCESS: MongoDB connected via SRV fallback');
            return fallback;
          } catch (fallbackErr: any) {
            console.error('ERROR: SRV fallback failed:', fallbackErr?.message || fallbackErr);
            cached!.promise = null; // Reset promise on failure
            throw err; // throw original error to preserve context
          }
        }

        console.error('Troubleshooting tips:');
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
    console.error('ERROR: MongoDB connection error:', e.message);
    throw new Error(`Database connection failed: ${e.message}`);
  }

  return cached!.conn;
}

export default dbConnect;
