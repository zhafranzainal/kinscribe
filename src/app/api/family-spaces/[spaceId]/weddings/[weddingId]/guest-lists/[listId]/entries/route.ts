import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { RsvpStatus } from '@prisma/client';

type Params = {
    params: Promise<{
        spaceId: string;
        weddingId: string;
        listId: string;
    }>
};

// GET - List all entries in a guest list
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { listId } = await params;

        const entries = await db.guestListEntry.findMany({
            where: { guestListId: listId },
            include: { person: true },
            orderBy: { createdAt: 'asc' },
        });

        return NextResponse.json(entries);
    } catch (error) {
        console.error('Failed to fetch entries:', error);
        return NextResponse.json(
            { message: 'Failed to fetch entries' },
            { status: 500 }
        );
    }
}

// POST - Add guest to list
const addGuestSchema = z.object({
    personId: z.string().optional(),
    manualName: z.string().optional(),
    manualEmail: z.string().email().optional().or(z.literal('')),
    manualPhone: z.string().optional(),
}).refine(
    (data) => data.personId || data.manualName,
    { message: 'Either personId or manualName is required' }
);

export async function POST(request: NextRequest, { params }: Params) {
    try {
        const { listId } = await params;
        const body = await request.json();
        const data = addGuestSchema.parse(body);

        // Check if person already in this list
        if (data.personId) {
            const existing = await db.guestListEntry.findFirst({
                where: {
                    guestListId: listId,
                    personId: data.personId,
                },
            });

            if (existing) {
                return NextResponse.json(
                    { message: 'Person already in this guest list' },
                    { status: 409 }
                );
            }
        }

        const entry = await db.guestListEntry.create({
            data: {
                personId: data.personId || null,
                manualName: data.manualName || null,
                manualEmail: data.manualEmail || null,
                manualPhone: data.manualPhone || null,
                rsvpStatus: RsvpStatus.PENDING,
                guestListId: listId,
            },
            include: { person: true },
        });

        return NextResponse.json(entry, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Validation error', errors: error.errors },
                { status: 400 }
            );
        }

        console.error('Failed to add guest:', error);
        return NextResponse.json(
            { message: 'Failed to add guest' },
            { status: 500 }
        );
    }
}
