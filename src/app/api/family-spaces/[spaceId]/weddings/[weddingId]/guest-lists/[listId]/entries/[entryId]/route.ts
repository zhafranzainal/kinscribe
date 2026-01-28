import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { RsvpStatus } from '@prisma/client';

type Params = {
    params: Promise<{
        spaceId: string;
        weddingId: string;
        listId: string;
        entryId: string;
    }>
};

// PATCH - Update guest entry
const updateGuestSchema = z.object({
    rsvpStatus: z.nativeEnum(RsvpStatus).optional(),
    plusOne: z.boolean().optional(),
    plusOneName: z.string().nullable().optional(),
    dietaryRestrictions: z.string().nullable().optional(),
    tableAssignment: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
});

export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const { entryId } = await params;
        const body = await request.json();
        const data = updateGuestSchema.parse(body);

        const entry = await db.guestListEntry.update({
            where: { id: entryId },
            data,
            include: { person: true },
        });

        return NextResponse.json(entry);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Validation error', errors: error.errors },
                { status: 400 }
            );
        }

        console.error('Failed to update guest:', error);
        return NextResponse.json(
            { message: 'Failed to update guest' },
            { status: 500 }
        );
    }
}

// DELETE - Remove guest from list
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const { entryId } = await params;

        await db.guestListEntry.delete({
            where: { id: entryId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to remove guest:', error);
        return NextResponse.json(
            { message: 'Failed to remove guest' },
            { status: 500 }
        );
    }
}
