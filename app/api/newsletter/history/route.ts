import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';

// Verify admin authentication
async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get('admin_session');
  return !!adminCookie?.value;
}

// GET - Get newsletter history (admin only)
export async function GET(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const [newsletters, total] = await Promise.all([
      Newsletter.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Newsletter.countDocuments(),
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        newsletters,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
    
  } catch (error) {
    console.error('Get newsletters error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch newsletter history' },
      { status: 500 }
    );
  }
}
