import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

type Params = {
    params: Promise<{
        spaceId: string;
        personId: string;
        subsectionId: string;
    }>
};

// GET - List entries
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { subsectionId } = await params;

        const entries = await db.biographyEntry.findMany({
            where: { subsectionId },
            orderBy: { sortOrder: 'asc' },
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

// POST - Create entry
const createEntrySchema = z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    date: z.string().optional(),
    location: z.string().optional(),
});

export async function POST(request: NextRequest, { params }: Params) {
    try {
        const { subsectionId } = await params;
        const body = await request.json();
        const data = createEntrySchema.parse(body);

        // Get max sort order
        const maxOrder = await db.biographyEntry.aggregate({
            where: { subsectionId },
            _max: { sortOrder: true },
        });

        const entry = await db.biographyEntry.create({
            data: {
                title: data.title || null,
                content: data.content || null,
                date: data.date ? new Date(data.date) : null,
                location: data.location || null,
                subsectionId,
                sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
            },
        });

        return NextResponse.json(entry, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Validation error', errors: error.errors },
                { status: 400 }
            );
        }

        console.error('Failed to create entry:', error);
        return NextResponse.json(
            { message: 'Failed to create entry' },
            { status: 500 }
        );
    }
}
