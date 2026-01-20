# MongoDB Connection Fix - DNS Resolution Issue

## Problem
Error: `querySrv ECONNREFUSED _mongodb._tcp.cluster0.trpgklj.mongodb.net`

This error occurred because Node.js on Windows was unable to resolve MongoDB Atlas SRV records using the default system DNS resolver.

## Root Cause
Windows DNS resolver sometimes refuses SRV record queries when using Node.js, causing `ECONNREFUSED` errors even though the DNS records exist and can be resolved by other tools (like `nslookup`).

## Solution Applied

### 1. Updated `lib/mongodb.ts`
- Removed default `dns.setServers()` approach that doesn't work reliably on Windows
- Implemented custom DNS Resolver using `dns/promises.Resolver`
- The custom resolver uses reliable public DNS servers: Google DNS (8.8.8.8) and Cloudflare (1.1.1.1)
- Added proper `authSource=admin` parameter for Atlas connections
- Ensured `tls=true` is set for secure connections

### 2. Key Changes
```typescript
import { Resolver } from 'dns/promises';

// In the fallback logic:
const resolver = new Resolver();
resolver.setServers(['8.8.8.8', '1.1.1.1', '208.67.222.222']);
const records = await resolver.resolveSrv(srvName);
```

### 3. Test Results
The fix was tested with `test-custom-resolver.js` and successfully:
- Resolved SRV records for the MongoDB cluster
- Connected to the database
- Verified database name and host

## How It Works

1. **Primary Connection Attempt**: First tries to connect using the SRV URI (mongodb+srv://)
2. **Fallback on DNS Error**: If SRV lookup fails with `querySrv` error:
   - Creates a custom DNS resolver with public DNS servers
   - Manually resolves SRV records to get the actual MongoDB host addresses
   - Builds a standard connection string (mongodb://) with all replica set members
   - Retries connection with the standard URI

## Files Modified
- `lib/mongodb.ts` - Updated DNS resolution logic with custom resolver

## Files Created for Testing
- `test-db-connection.js` - Basic connection test
- `test-standard-connection.js` - Test with standard URI format
- `test-custom-resolver.js` - Test with custom DNS resolver (successful)

## Next Steps
1. Restart your Next.js development server
2. The connection should now work automatically
3. The custom resolver will be used whenever the default SRV lookup fails

## Alternative Solution (If Still Having Issues)
If you continue to experience issues, you can use the standard (non-SRV) MongoDB URI format directly in your `.env.local`:

```env
MONGODB_URI=mongodb://aniketsingh9322_db_user:UKxrEtvM1KDGiUSG@ac-wqpnywl-shard-00-00.trpgklj.mongodb.net:27017,ac-wqpnywl-shard-00-01.trpgklj.mongodb.net:27017,ac-wqpnywl-shard-00-02.trpgklj.mongodb.net:27017/CricketBox?retryWrites=true&w=majority&authSource=admin&tls=true
```

This bypasses SRV lookup entirely but requires updating the URI if MongoDB adds or removes replica set members.
