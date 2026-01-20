# Admin Slot Freeze - Setup & Deployment Guide

## 🎯 Pre-Deployment Checklist

### Environment Variables
Ensure you have these in `.env.local`:
```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_API_URL=http://localhost:3000  # or your deployment URL
```

### Database
```bash
# MongoDB collections will be created automatically on first use
# No manual setup needed - Mongoose handles schema creation
```

---

## 🚀 Step-by-Step Deployment

### Step 1: Install Dependencies
```bash
npm install
# or
yarn install
```

### Step 2: Verify MongoDB Connection
```bash
# Test your connection by running any booking operation
npm run dev
```

### Step 3: Create Admin Account (if not exists)
Use your existing admin login system. The feature uses the same auth mechanism.

### Step 4: Test the Feature
1. Login as admin
2. Navigate to `/admin/slots`
3. Try freezing a slot
4. Verify it's hidden in user booking form

### Step 5: Deploy to Production
```bash
# Build the project
npm run build

# Test production build
npm run start

# Or deploy using your hosting platform
# (Vercel, Netlify, Docker, etc.)
```

---

## ✅ Post-Deployment Verification

### Test 1: Admin Can Access Slot Manager
```bash
curl http://your-domain/admin/slots
# Should redirect to login if not authenticated
```

### Test 2: API Endpoints Work
```bash
# Freeze a slot
curl -X POST http://your-domain/api/admin/slots/freeze \
  -H "Content-Type: application/json" \
  -H "Cookie: adminToken=..." \
  -d '{
    "bookingType": "match",
    "sport": "Cricket",
    "date": "2024-01-25",
    "slot": "06:00-07:00"
  }'

# Get frozen slots
curl http://your-domain/api/admin/slots/get-frozen \
  -H "Cookie: adminToken=..."
```

### Test 3: Users Can't See Frozen Slots
```bash
curl http://your-domain/api/turf-bookings/slots?date=2024-01-25&sport=Cricket&bookingType=match
# Verify frozen slots have "available": false, "isFrozen": true
```

### Test 4: Backend Prevents Booking
```bash
curl -X POST http://your-domain/api/turf-bookings/create \
  -H "Content-Type: application/json" \
  -d '{
    "bookingType": "match",
    "sport": "Cricket",
    "date": "2024-01-25",
    "slot": "06:00-07:00",
    "name": "Test User",
    "mobile": "9876543210",
    "email": "test@example.com"
  }'
# Should return 403 Forbidden if slot is frozen
```

---

## 🔧 Configuration

### Database Indexes
Indexes are created automatically on app startup. No manual configuration needed.

### Admin Authentication
The feature uses your existing admin auth system. No changes needed.

### API Routes
All routes are already configured and ready to use.

---

## 📊 Monitoring

### Check MongoDB Collection Size
```bash
# In MongoDB compass or shell
db.slots.countDocuments({ isFrozen: true })
# Shows number of frozen slots
```

### View Frozen Slots for a Date
```bash
db.slots.find({ date: "2024-01-25", isFrozen: true })
```

### Check Admin History
```bash
db.slots.find({ frozenBy: "admin_username" })
```

---

## 🐛 Troubleshooting Deployment

### Issue: 404 on /admin/slots
**Solution**: Ensure the page file exists at `app/admin/slots/page.tsx`

### Issue: MongoDB connection error
**Solution**: 
1. Check MONGODB_URI in .env.local
2. Verify IP whitelist in MongoDB Atlas
3. Check network connectivity

### Issue: Admin authentication fails
**Solution**:
1. Clear browser cookies
2. Login again
3. Check admin token is being set correctly

### Issue: Frozen slots still visible to users
**Solution**:
1. Hard refresh browser (Ctrl+Shift+R)
2. Check browser cache
3. Verify slot is actually frozen in DB

### Issue: API returns 401 Unauthorized
**Solution**:
1. Make sure credentials: 'include' is set in fetch requests
2. Check cookie is being sent
3. Verify admin token hasn't expired

---

## 📈 Performance Tuning

### Database Indexes
The Slot collection has optimal indexes:
```
- { date: 1, bookingType: 1, sport: 1, isFrozen: 1 }
- { isFrozen: 1 }
- { date: 1, slot: 1, sport: 1, bookingType: 1 }
```

### Query Optimization
All queries are optimized:
- Frozen slots query: Returns only isFrozen = true
- Available slots query: Uses indexes efficiently
- Booking validation: Single document lookup

### Caching Strategy
For high-traffic scenarios, consider caching:
```typescript
// Example caching strategy (optional enhancement)
const cachedFrozenSlots = {};

async function getFrozenSlots(date, sport) {
  const cacheKey = `${date}:${sport}`;
  
  if (cacheKey in cachedFrozenSlots) {
    return cachedFrozenSlots[cacheKey];
  }
  
  const slots = await Slot.find({ date, sport, isFrozen: true });
  cachedFrozenSlots[cacheKey] = slots;
  
  // Clear cache after 5 minutes
  setTimeout(() => delete cachedFrozenSlots[cacheKey], 300000);
  
  return slots;
}
```

---

## 🔐 Security Hardening

### Review Checklist

✅ **Authentication**
- Admin token validation in all APIs
- Session timeout configured
- Password hashing enabled

✅ **Authorization**
- Admin-only endpoints protected
- User cannot access admin APIs
- Proper status codes returned

✅ **Input Validation**
- Date format validation
- Sport enum validation
- Booking type validation
- Slot format validation

✅ **Output Sanitization**
- Error messages don't leak sensitive data
- Admin usernames visible only to admins
- No SQL injection possible (using MongoDB)

### Additional Security (Optional)

```typescript
// Rate limiting for API endpoints
// Install: npm install express-rate-limit
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Apply to freeze/unfreeze endpoints
app.use('/api/admin/slots/', limiter);
```

---

## 📦 Backup Strategy

### Backup Frozen Slots
```bash
# Export frozen slots from MongoDB
mongoexport --uri "mongodb+srv://..." \
  --collection slots \
  --query '{"isFrozen": true}' \
  --out frozen_slots_backup.json
```

### Restore Frozen Slots
```bash
# If needed to restore
mongoimport --uri "mongodb+srv://..." \
  --collection slots \
  --file frozen_slots_backup.json
```

---

## 🚨 Incident Response

### If Frozen Slots Bug Occurs

**Scenario 1: Users can see frozen slots**
```bash
# Quickly unfreeze all slots
db.slots.updateMany(
  { isFrozen: true },
  { $set: { isFrozen: false, frozenBy: null, frozenAt: null } }
)
```

**Scenario 2: Users can't book available slots**
```bash
# Check if slots are wrongly marked as frozen
db.slots.find({ isFrozen: true }).count()

# If too many, check for bugs in freeze API
```

**Scenario 3: Admin pages crash**
```bash
# Restart the application
pm2 restart app  # or docker restart container
```

---

## 📊 Analytics & Reporting (Optional)

Track frozen slot usage:

```typescript
// Add to analytics
const logFreezeAction = async (action, slotData, adminId) => {
  const log = {
    action, // 'freeze' or 'unfreeze'
    ...slotData,
    adminId,
    timestamp: new Date(),
  };
  
  await db.collection('frozen_slot_logs').insertOne(log);
};

// Usage
logFreezeAction('freeze', slotData, adminId);

// Query reports
db.frozen_slot_logs.aggregate([
  { $match: { action: 'freeze' } },
  { $group: { _id: '$adminId', count: { $sum: 1 } } },
])
```

---

## 🎓 Team Training

Provide this to your team:

### Admin Team
1. Read: [SLOT_FREEZE_QUICK_REFERENCE.md](./SLOT_FREEZE_QUICK_REFERENCE.md)
2. Access: Go to `/admin/slots`
3. Practice: Freeze and unfreeze some slots

### Developer Team
1. Read: [SLOT_FREEZE_IMPLEMENTATION.md](./SLOT_FREEZE_IMPLEMENTATION.md)
2. Review: Check all created files
3. Study: Run through [SLOT_FREEZE_EXAMPLES.js](./SLOT_FREEZE_EXAMPLES.js)

---

## 📝 Maintenance Tasks

### Weekly
- [ ] Check for any errors in logs
- [ ] Verify frozen slots are working correctly
- [ ] Unfreeze expired slots if any

### Monthly
- [ ] Review database size
- [ ] Check index performance
- [ ] Analyze frozen slot patterns

### Quarterly
- [ ] Update security measures if needed
- [ ] Optimize queries if needed
- [ ] Review error logs

---

## 🚀 Rollback Plan

If something goes wrong:

### Option 1: Revert Code Changes
```bash
git revert <commit-hash>
npm run build
npm start
```

### Option 2: Disable Feature Temporarily
```bash
# In next.config.js
const disableSlotFreeze = true;

// In AdminSlotFreezePage
if (disableSlotFreeze) {
  return <div>Feature temporarily disabled</div>;
}
```

### Option 3: Clear All Frozen Slots
```bash
db.slots.deleteMany({})
```

---

## 📞 Support Contacts

- **Documentation**: See all .md files
- **Code Issues**: Check GitHub repository
- **Database Issues**: Contact MongoDB support
- **Deployment Issues**: Check hosting provider docs

---

## ✅ Final Deployment Checklist

- [ ] All files created and modified
- [ ] MongoDB connection tested
- [ ] Admin account exists
- [ ] API endpoints tested
- [ ] Admin page accessible
- [ ] Frozen slots hidden from users
- [ ] Backend validation working
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Security is verified
- [ ] Documentation reviewed
- [ ] Team trained
- [ ] Backup strategy ready
- [ ] Monitoring set up
- [ ] Rollback plan ready

---

## 🎉 Deployment Complete!

Once all checks are done, you're ready for production!

**Status: ✅ READY TO DEPLOY**

---

*Last Updated: January 2026*
*Version: 1.0*
