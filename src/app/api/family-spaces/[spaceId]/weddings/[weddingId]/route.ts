import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

type Params = { params: Promise<{ spaceId: string; weddingId: string }> };

// GET /api/family-spaces/[spaceId]/weddings/[weddingId]
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { spaceId, weddingId } = await params;

        const wedding = await db.weddingEvent.findFirst({
            where: {
                id: weddingId,
                familySpaceId: spaceId,
            },
            include: {
                person1: true,
                person2: true,
                guestLists: {
                    include: {
                        entries: {
                            include: {
                                person: true,
                            },
                            orderBy: { createdAt: 'asc' },
                        },
                    },
                },
            },
        });

        if (!wedding) {
            return NextResponse.json(
                { message: 'Wedding not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(wedding);
    } catch (error) {
        console.error('Failed to fetch wedding:', error);
        return NextResponse.json(
            { message: 'Failed to fetch wedding' },
            { status: 500 }
        );
    }
}

// PATCH /api/family-spaces/[spaceId]/weddings/[weddingId]
const updateWeddingSchema = z.object({
    name: z.string().optional(),
    date: z.string().nullable().optional(),
    venue: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
});

export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const { spaceId, weddingId } = await params;
        const body = await request.json();
        const data = updateWeddingSchema.parse(body);

        const wedding = await db.weddingEvent.update({
            where: {
                id: weddingId,
                familySpaceId: spaceId,
            },
            data: {
                ...data,
                date: data.date ? new Date(data.date) : data.date === null ? null : undefined,
            },
            include: {
                person1: true,
                person2: true,
                guestLists: true,
            },
        });

        return NextResponse.json(wedding);
    } catch (error) {
        console.error('Failed to update wedding:', error);
        return NextResponse.json(
            { message: 'Failed to update wedding' },
            { status: 500 }
        );
    }
}

// DELETE /api/family-spaces/[spaceId]/weddings/[weddingId]
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const { spaceId, weddingId } = await params;

        await db.weddingEvent.delete({
            where: {
                id: weddingId,
                familySpaceId: spaceId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete wedding:', error);
        return NextResponse.json(
            { message: 'Failed to delete wedding' },
            { status: 500 }
        );
    }
}
