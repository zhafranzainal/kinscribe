import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { Gender } from '@prisma/client';

type Params = { params: Promise<{ spaceId: string; personId: string }> };

// GET /api/family-spaces/[spaceId]/persons/[personId]
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { spaceId, personId } = await params;

        const person = await db.person.findFirst({
            where: {
                id: personId,
                familySpaceId: spaceId,
            },
            include: {
                biography: {
                    include: {
                        sections: {
                            include: {
                                subsections: {
                                    include: {
                                        entries: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!person) {
            return NextResponse.json(
                { message: 'Person not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(person);
    } catch (error) {
        console.error('Failed to fetch person:', error);
        return NextResponse.json(
            { message: 'Failed to fetch person' },
            { status: 500 }
        );
    }
}

// PATCH /api/family-spaces/[spaceId]/persons/[personId]
const updatePersonSchema = z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().nullable().optional(),
    gender: z.nativeEnum(Gender).nullable().optional(),
    birthDate: z.string().nullable().optional(),
    deathDate: z.string().nullable().optional(),
    birthPlace: z.string().nullable().optional(),
    bio: z.string().nullable().optional(),
    profilePhotoUrl: z.string().nullable().optional(),
});

export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const { spaceId, personId } = await params;
        const body = await request.json();
        const data = updatePersonSchema.parse(body);

        const person = await db.person.update({
            where: {
                id: personId,
                familySpaceId: spaceId,
            },
            data: {
                ...data,
                birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
                deathDate: data.deathDate ? new Date(data.deathDate) : undefined,
            },
        });

        return NextResponse.json(person);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Validation error', errors: error.errors },
                { status: 400 }
            );
        }

        console.error('Failed to update person:', error);
        return NextResponse.json(
            { message: 'Failed to update person' },
            { status: 500 }
        );
    }
}

// DELETE /api/family-spaces/[spaceId]/persons/[personId]
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const { spaceId, personId } = await params;

        await db.person.delete({
            where: {
                id: personId,
                familySpaceId: spaceId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete person:', error);
        return NextResponse.json(
            { message: 'Failed to delete person' },
            { status: 500 }
        );
    }
}
