import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import PaymentSettings from '@/models/PaymentSettings';

// Helper to verify admin authentication
async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const adminToken = cookieStore.get('adminToken');
    return !!adminToken?.value;
  } catch {
    return false;
  }
}

// GET - Check payment status (public endpoint)
export async function GET() {
  try {
    await connectDB();
    
    // Get or create payment settings
    let settings = await PaymentSettings.findOne();
    if (!settings) {
      settings = await PaymentSettings.create({
        paymentsEnabled: true,
        disabledReason: '',
        lastUpdatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      paymentsEnabled: settings.paymentsEnabled,
      disabledReason: settings.disabledReason || '',
    });
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment settings' },
      { status: 500 }
    );
  }
}

// POST - Update payment status (admin only)
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const body = await request.json();
    const { paymentsEnabled, disabledReason } = body;

    if (typeof paymentsEnabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'paymentsEnabled must be a boolean' },
        { status: 400 }
      );
    }

    // Get admin username from cookie for audit trail
    const cookieStore = cookies();
    const adminToken = cookieStore.get('adminToken');
    let adminUsername = 'Unknown';
    
    if (adminToken?.value) {
      try {
        const decoded = Buffer.from(adminToken.value, 'base64').toString();
        adminUsername = decoded.split(':')[0] || 'Unknown';
      } catch {
        // Keep default username
      }
    }

    // Update or create settings
    let settings = await PaymentSettings.findOne();
    if (!settings) {
      settings = await PaymentSettings.create({
        paymentsEnabled,
        disabledReason: disabledReason || '',
        lastUpdatedBy: adminUsername,
        lastUpdatedAt: new Date(),
      });
    } else {
      settings.paymentsEnabled = paymentsEnabled;
      settings.disabledReason = disabledReason || '';
      settings.lastUpdatedBy = adminUsername;
      settings.lastUpdatedAt = new Date();
      await settings.save();
    }

    console.log(`Payment settings updated by ${adminUsername}: paymentsEnabled=${paymentsEnabled}`);

    return NextResponse.json({
      success: true,
      message: `Payments ${paymentsEnabled ? 'enabled' : 'disabled'} successfully`,
      paymentsEnabled: settings.paymentsEnabled,
      disabledReason: settings.disabledReason,
      lastUpdatedBy: settings.lastUpdatedBy,
      lastUpdatedAt: settings.lastUpdatedAt,
    });
  } catch (error) {
    console.error('Error updating payment settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment settings' },
      { status: 500 }
    );
  }
}
