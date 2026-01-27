import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { Gender, ClaimStatus } from '@prisma/client';

type Params = { params: Promise<{ spaceId: string }> };

// GET /api/family-spaces/[spaceId]/persons - List all persons
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { spaceId } = await params;

        const persons = await db.person.findMany({
            where: { familySpaceId: spaceId },
            orderBy: { createdAt: 'asc' },
        });

        return NextResponse.json(persons);
    } catch (error) {
        console.error('Failed to fetch persons:', error);
        return NextResponse.json(
            { message: 'Failed to fetch persons' },
            { status: 500 }
        );
    }
}

// POST /api/family-spaces/[spaceId]/persons - Create a new person
const createPersonSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().nullable().optional(),
    gender: z.nativeEnum(Gender).nullable().optional(),
    birthDate: z.string().nullable().optional(),
    deathDate: z.string().nullable().optional(),
    birthPlace: z.string().nullable().optional(),
    bio: z.string().nullable().optional(),
});

export async function POST(request: NextRequest, { params }: Params) {
    try {
        const { spaceId } = await params;
        const body = await request.json();
        const data = createPersonSchema.parse(body);

        // Verify space exists
        const space = await db.familySpace.findUnique({
            where: { id: spaceId },
        });

        if (!space) {
            return NextResponse.json(
                { message: 'Family space not found' },
                { status: 404 }
            );
        }

        const person = await db.person.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName || null,
                gender: data.gender || null,
                birthDate: data.birthDate ? new Date(data.birthDate) : null,
                deathDate: data.deathDate ? new Date(data.deathDate) : null,
                birthPlace: data.birthPlace || null,
                bio: data.bio || null,
                status: ClaimStatus.UNCLAIMED,
                familySpaceId: spaceId,
            },
        });

        return NextResponse.json(person, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Validation error', errors: error.errors },
                { status: 400 }
            );
        }

        console.error('Failed to create person:', error);
        return NextResponse.json(
            { message: 'Failed to create person' },
            { status: 500 }
        );
    }
}
