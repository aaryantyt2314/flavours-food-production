import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');

    const where: any = { isAvailable: true };

    if (category) {
      const cat = await db.category.findFirst({ where: { slug: category } });
      if (cat) where.categoryId = cat.id;
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const items = await db.menuItem.findMany({
      where,
      include: { category: true },
      orderBy: [{ categoryId: 'asc' }, { order: 'asc' }],
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Menu API error:', error);
    return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 });
  }
}
