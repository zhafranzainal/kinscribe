import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// GET /api/family-spaces - List all family spaces
export async function GET() {
    try {
        const spaces = await db.familySpace.findMany({
            include: {
                _count: {
                    select: { persons: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(spaces);
    } catch (error) {
        console.error('Failed to fetch family spaces:', error);
        return NextResponse.json(
            { message: 'Failed to fetch family spaces' },
            { status: 500 }
        );
    }
}

// POST /api/family-spaces - Create a new family space
const createSpaceSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with dashes'),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const data = createSpaceSchema.parse(body);

        // For now, create a temporary user (we'll add auth later)
        let user = await db.user.findFirst();

        if (!user) {
            user = await db.user.create({
                data: {
                    email: 'demo@kinscribe.com',
                    name: 'Demo User',
                },
            });
        }

        const space = await db.familySpace.create({
            data: {
                name: data.name,
                slug: data.slug,
                ownerId: user.id,
            },
        });

        return NextResponse.json(space, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Validation error', errors: error.errors },
                { status: 400 }
            );
        }

        console.error('Failed to create family space:', error);
        return NextResponse.json(
            { message: 'Failed to create family space' },
            { status: 500 }
        );
    }
}
