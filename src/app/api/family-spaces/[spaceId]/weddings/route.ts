import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

type Params = { params: Promise<{ spaceId: string }> };

// GET /api/family-spaces/[spaceId]/weddings
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { spaceId } = await params;

        const weddings = await db.weddingEvent.findMany({
            where: { familySpaceId: spaceId },
            include: {
                person1: true,
                person2: true,
                guestLists: {
                    include: {
                        _count: {
                            select: { entries: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(weddings);
    } catch (error) {
        console.error('Failed to fetch weddings:', error);
        return NextResponse.json(
            { message: 'Failed to fetch weddings' },
            { status: 500 }
        );
    }
}

// POST /api/family-spaces/[spaceId]/weddings
const createWeddingSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    date: z.string().optional(),
    venue: z.string().optional(),
    person1Id: z.string().min(1, 'Person 1 is required'),
    person2Id: z.string().min(1, 'Person 2 is required'),
});

export async function POST(request: NextRequest, { params }: Params) {
    try {
        const { spaceId } = await params;
        const body = await request.json();
        const data = createWeddingSchema.parse(body);

        const wedding = await db.weddingEvent.create({
            data: {
                name: data.name,
                date: data.date ? new Date(data.date) : null,
                venue: data.venue || null,
                person1Id: data.person1Id,
                person2Id: data.person2Id,
                familySpaceId: spaceId,
                guestLists: {
                    create: [
                        { name: "Groom's Side" },
                        { name: "Bride's Side" },
                        { name: 'Friends' },
                        { name: 'Colleagues' },
                    ],
                },
            },
            include: {
                person1: true,
                person2: true,
                guestLists: true,
            },
        });

        return NextResponse.json(wedding, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Validation error', errors: error.errors },
                { status: 400 }
            );
        }

        console.error('Failed to create wedding:', error);
        return NextResponse.json(
            { message: 'Failed to create wedding' },
            { status: 500 }
        );
    }
}
