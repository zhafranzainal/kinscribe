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

// PATCH - Update subsection content
const updateSubsectionSchema = z.object({
    title: z.string().optional(),
    content: z.string().nullable().optional(),
});

export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const { subsectionId } = await params;
        const body = await request.json();
        const data = updateSubsectionSchema.parse(body);

        const subsection = await db.biographySubsection.update({
            where: { id: subsectionId },
            data,
            include: {
                entries: {
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });

        return NextResponse.json(subsection);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Validation error', errors: error.errors },
                { status: 400 }
            );
        }

        console.error('Failed to update subsection:', error);
        return NextResponse.json(
            { message: 'Failed to update subsection' },
            { status: 500 }
        );
    }
}
