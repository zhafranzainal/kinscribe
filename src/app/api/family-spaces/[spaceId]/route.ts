import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type Params = { params: Promise<{ spaceId: string }> };

// GET /api/family-spaces/[spaceId] - Get a family space with all data
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { spaceId } = await params;

        const space = await db.familySpace.findUnique({
            where: { id: spaceId },
            include: {
                persons: {
                    orderBy: { createdAt: 'asc' },
                },
                relationships: true,
            },
        });

        if (!space) {
            return NextResponse.json(
                { message: 'Family space not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(space);
    } catch (error) {
        console.error('Failed to fetch family space:', error);
        return NextResponse.json(
            { message: 'Failed to fetch family space' },
            { status: 500 }
        );
    }
}

// DELETE /api/family-spaces/[spaceId] - Delete a family space
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const { spaceId } = await params;

        await db.familySpace.delete({
            where: { id: spaceId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete family space:', error);
        return NextResponse.json(
            { message: 'Failed to delete family space' },
            { status: 500 }
        );
    }
}
