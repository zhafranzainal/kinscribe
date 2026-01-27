import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { BIOGRAPHY_SECTIONS } from '@/features/biography/constants/section';
import { Visibility } from '@prisma/client';

type Params = { params: Promise<{ spaceId: string; personId: string }> };

// GET /api/family-spaces/[spaceId]/persons/[personId]/biography
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { spaceId, personId } = await params;

        // Find or create biography
        let biography = await db.biography.findUnique({
            where: { personId },
            include: {
                sections: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        subsections: {
                            orderBy: { sortOrder: 'asc' },
                            include: {
                                entries: {
                                    orderBy: { sortOrder: 'asc' },
                                },
                            },
                        },
                    },
                },
            },
        });

        // If no biography exists, create one with default sections
        if (!biography) {
            biography = await createDefaultBiography(personId);
        }

        return NextResponse.json(biography);
    } catch (error) {
        console.error('Failed to fetch biography:', error);
        return NextResponse.json(
            { message: 'Failed to fetch biography' },
            { status: 500 }
        );
    }
}

// Helper to create default biography with all sections
async function createDefaultBiography(personId: string) {
    return db.biography.create({
        data: {
            personId,
            sections: {
                create: BIOGRAPHY_SECTIONS.map((section, index) => ({
                    sectionType: section.type,
                    sortOrder: index,
                    visibility: Visibility.FAMILY,
                    subsections: {
                        create: section.defaultSubsections.map((title, subIndex) => ({
                            title,
                            sortOrder: subIndex,
                        })),
                    },
                })),
            },
        },
        include: {
            sections: {
                orderBy: { sortOrder: 'asc' },
                include: {
                    subsections: {
                        orderBy: { sortOrder: 'asc' },
                        include: {
                            entries: {
                                orderBy: { sortOrder: 'asc' },
                            },
                        },
                    },
                },
            },
        },
    });
}
