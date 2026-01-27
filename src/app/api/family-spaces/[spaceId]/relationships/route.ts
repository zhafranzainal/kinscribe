import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { RelationshipType } from '@prisma/client';

type Params = { params: Promise<{ spaceId: string }> };

// GET /api/family-spaces/[spaceId]/relationships
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { spaceId } = await params;

        const relationships = await db.relationship.findMany({
            where: { familySpaceId: spaceId },
        });

        return NextResponse.json(relationships);
    } catch (error) {
        console.error('Failed to fetch relationships:', error);
        return NextResponse.json(
            { message: 'Failed to fetch relationships' },
            { status: 500 }
        );
    }
}

// POST /api/family-spaces/[spaceId]/relationships
const createRelationshipSchema = z.object({
    type: z.nativeEnum(RelationshipType),
    person1Id: z.string().min(1),
    person2Id: z.string().min(1),
    marriageDate: z.string().nullable().optional(),
    divorceDate: z.string().nullable().optional(),
});

export async function POST(request: NextRequest, { params }: Params) {
    try {
        const { spaceId } = await params;
        const body = await request.json();
        const data = createRelationshipSchema.parse(body);

        // Check if relationship already exists
        const existing = await db.relationship.findFirst({
            where: {
                familySpaceId: spaceId,
                type: data.type,
                OR: [
                    { person1Id: data.person1Id, person2Id: data.person2Id },
                    { person1Id: data.person2Id, person2Id: data.person1Id },
                ],
            },
        });

        if (existing) {
            return NextResponse.json(
                { message: 'Relationship already exists' },
                { status: 409 }
            );
        }

        const relationship = await db.relationship.create({
            data: {
                type: data.type,
                person1Id: data.person1Id,
                person2Id: data.person2Id,
                marriageDate: data.marriageDate ? new Date(data.marriageDate) : null,
                divorceDate: data.divorceDate ? new Date(data.divorceDate) : null,
                familySpaceId: spaceId,
            },
        });

        return NextResponse.json(relationship, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Validation error', errors: error.errors },
                { status: 400 }
            );
        }

        console.error('Failed to create relationship:', error);
        return NextResponse.json(
            { message: 'Failed to create relationship' },
            { status: 500 }
        );
    }
}
