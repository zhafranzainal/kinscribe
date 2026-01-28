import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

type Params = { params: Promise<{ spaceId: string; weddingId: string }> };

// POST /api/family-spaces/[spaceId]/weddings/[weddingId]/guest-lists
const createGuestListSchema = z.object({
    name: z.string().min(1, 'Name is required'),
});

export async function POST(request: NextRequest, { params }: Params) {
    try {
        const { weddingId } = await params;
        const body = await request.json();
        const data = createGuestListSchema.parse(body);

        const guestList = await db.guestList.create({
            data: {
                name: data.name,
                weddingEventId: weddingId,
            },
            include: {
                entries: {
                    include: {
                        person: true,
                    },
                },
            },
        });

        return NextResponse.json(guestList, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Validation error', errors: error.errors },
                { status: 400 }
            );
        }

        console.error('Failed to create guest list:', error);
        return NextResponse.json(
            { message: 'Failed to create guest list' },
            { status: 500 }
        );
    }
}
