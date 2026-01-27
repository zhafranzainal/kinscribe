import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

type Params = {
    params: Promise<{
        spaceId: string;
        personId: string;
        subsectionId: string;
        entryId: string;
    }>
};

// PATCH - Update entry
const updateEntrySchema = z.object({
    title: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    date: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
});

export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const { entryId } = await params;
        const body = await request.json();
        const data = updateEntrySchema.parse(body);

        const entry = await db.biographyEntry.update({
            where: { id: entryId },
            data: {
                ...data,
                date: data.date ? new Date(data.date) : data.date === null ? null : undefined,
            },
        });

        return NextResponse.json(entry);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Validation error', errors: error.errors },
                { status: 400 }
            );
        }

        console.error('Failed to update entry:', error);
        return NextResponse.json(
            { message: 'Failed to update entry' },
            { status: 500 }
        );
    }
}

// DELETE - Delete entry
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const { entryId } = await params;

        await db.biographyEntry.delete({
            where: { id: entryId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete entry:', error);
        return NextResponse.json(
            { message: 'Failed to delete entry' },
            { status: 500 }
        );
    }
}
