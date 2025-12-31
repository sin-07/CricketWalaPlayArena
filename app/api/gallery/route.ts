import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GalleryImage from '@/models/GalleryImage';
import { verifyAdminAuth } from '@/lib/authUtils';

// GET - Fetch all gallery images
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const query = activeOnly ? { isActive: true } : {};
    const images = await GalleryImage.find(query).sort({ order: 1, uploadedAt: -1 });

    return NextResponse.json({ images }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching gallery images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery images' },
      { status: 500 }
    );
  }
}

// POST - Add new gallery image (Admin only)
export async function POST(request: NextRequest) {
  // Verify admin authentication
  const authResult = await verifyAdminAuth();
  if (!authResult.authenticated && authResult.response) {
    return authResult.response;
  }

  try {
    await dbConnect();

    const body = await request.json();
    const { url, title, description, order } = body;

    if (!url || !title) {
      return NextResponse.json(
        { error: 'URL and title are required' },
        { status: 400 }
      );
    }

    const image = await GalleryImage.create({
      url,
      title,
      description: description || '',
      order: order || 0,
      isActive: true,
    });

    return NextResponse.json({ image }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating gallery image:', error);
    return NextResponse.json(
      { error: 'Failed to create gallery image' },
      { status: 500 }
    );
  }
}

// PUT - Update gallery image (Admin only)
export async function PUT(request: NextRequest) {
  // Verify admin authentication
  const authResult = await verifyAdminAuth();
  if (!authResult.authenticated && authResult.response) {
    return authResult.response;
  }

  try {
    await dbConnect();

    const body = await request.json();
    const { id, url, title, description, order, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    const image = await GalleryImage.findByIdAndUpdate(
      id,
      { url, title, description, order, isActive },
      { new: true, runValidators: true }
    );

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ image }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating gallery image:', error);
    return NextResponse.json(
      { error: 'Failed to update gallery image' },
      { status: 500 }
    );
  }
}

// DELETE - Delete gallery image (Admin only)
export async function DELETE(request: NextRequest) {
  // Verify admin authentication
  const authResult = await verifyAdminAuth();
  if (!authResult.authenticated && authResult.response) {
    return authResult.response;
  }

  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    const image = await GalleryImage.findByIdAndDelete(id);

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Image deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting gallery image:', error);
    return NextResponse.json(
      { error: 'Failed to delete gallery image' },
      { status: 500 }
    );
  }
}
