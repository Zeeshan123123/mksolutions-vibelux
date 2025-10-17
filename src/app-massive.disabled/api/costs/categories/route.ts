import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';

// GET cost categories
export async function GET(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = await prisma.costCategory.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { expenses: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error('api', 'Error fetching categories:', error );
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST create category
export async function POST(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, parentId } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const category = await prisma.costCategory.create({
      data: {
        name,
        description,
        type: body.type || 'OPERATIONAL'
      }
    });

    return NextResponse.json({
      success: true,
      data: category
    });
  } catch (error) {
    logger.error('api', 'Error creating category:', error );
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

// Seed default categories
export async function seedDefaultCategories() {
  const defaultCategories = [
    { name: 'Labor', description: 'Employee wages and benefits', type: 'OPERATIONAL' },
    { name: 'Utilities', description: 'Electricity, water, gas', type: 'OPERATIONAL' },
    { name: 'Nutrients', description: 'Fertilizers and growing media', type: 'OPERATIONAL' },
    { name: 'Supplies', description: 'General cultivation supplies', type: 'OPERATIONAL' },
    { name: 'Equipment', description: 'Tools and small equipment', type: 'CAPITAL' },
    { name: 'Facility', description: 'Rent, maintenance, repairs', type: 'OPERATIONAL' },
    { name: 'Packaging', description: 'Product packaging materials', type: 'OPERATIONAL' },
    { name: 'Testing', description: 'Lab testing and compliance', type: 'OPERATIONAL' },
    { name: 'Transportation', description: 'Delivery and logistics', type: 'OPERATIONAL' },
    { name: 'Marketing', description: 'Advertising and promotion', type: 'OPERATIONAL' },
    { name: 'Professional', description: 'Legal, accounting, consulting', type: 'OPERATIONAL' },
    { name: 'Insurance', description: 'Business insurance premiums', type: 'OPERATIONAL' },
    { name: 'Other', description: 'Miscellaneous expenses', type: 'OPERATIONAL' }
  ];

  // Create default categories if they don't exist
  for (const cat of defaultCategories) {
    const existing = await prisma.costCategory.findFirst({
      where: { name: cat.name }
    });
    if (!existing) {
      await prisma.costCategory.create({
        data: cat
      });
    }
  }
}