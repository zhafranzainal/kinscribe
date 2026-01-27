'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { fetchApi } from '@/lib/api';
import type { Person } from '@/types';
import type { BiographyWithSections } from '../types';
import { BiographySidebar } from './biography-sidebar';
import { BiographyContent } from './biography-content';
import { getFullName } from '@/features/family-tree/utils/tree-helpers';

type Props = {
    personId: string;
    spaceId: string;
};

export function BiographyView({ personId, spaceId }: Props) {
    const router = useRouter();
    const [person, setPerson] = useState<Person | null>(null);
    const [biography, setBiography] = useState<BiographyWithSections | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [activeSubsectionId, setActiveSubsectionId] = useState<string | null>(null);

    // Fetch person and biography
    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                const [personData, bioData] = await Promise.all([
                    fetchApi<Person>(`/api/family-spaces/${spaceId}/persons/${personId}`),
                    fetchApi<BiographyWithSections>(
                        `/api/family-spaces/${spaceId}/persons/${personId}/biography`
                    ),
                ]);

                setPerson(personData);
                setBiography(bioData);

                // Set first section as active
                if (bioData.sections.length > 0) {
                    setActiveSectionId(bioData.sections[0].id);
                    if (bioData.sections[0].subsections.length > 0) {
                        setActiveSubsectionId(bioData.sections[0].subsections[0].id);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [personId, spaceId]);

    // Update biography in state
    const updateBiography = (updated: BiographyWithSections) => {
        setBiography(updated);
    };

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!person || !biography) {
        return (
            <div className="h-screen flex items-center justify-center">
                <p className="text-slate-500">Person not found</p>
            </div>
        );
    }

    const fullName = getFullName(person);
    const activeSection = biography.sections.find((s) => s.id === activeSectionId);

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <header className="border-b bg-white px-6 py-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>

                <Avatar className="h-10 w-10">
                    {person.profilePhotoUrl && (
                        <AvatarImage src={person.profilePhotoUrl} alt={fullName} />
                    )}
                    <AvatarFallback>
                        {person.firstName?.[0]}
                        {person.lastName?.[0]}
                    </AvatarFallback>
                </Avatar>

                <div>
                    <h1 className="text-xl font-semibold">{fullName}</h1>
                    <p className="text-sm text-slate-500">Biography</p>
                </div>
            </header>

            {/* Main content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <BiographySidebar
                    sections={biography.sections}
                    activeSectionId={activeSectionId}
                    activeSubsectionId={activeSubsectionId}
                    onSectionClick={(sectionId) => {
                        setActiveSectionId(sectionId);
                        const section = biography.sections.find((s) => s.id === sectionId);
                        if (section?.subsections.length) {
                            setActiveSubsectionId(section.subsections[0].id);
                        }
                    }}
                    onSubsectionClick={(subsectionId) => {
                        setActiveSubsectionId(subsectionId);
                    }}
                />

                {/* Content area */}
                <BiographyContent
                    section={activeSection || null}
                    activeSubsectionId={activeSubsectionId}
                    spaceId={spaceId}
                    personId={personId}
                    onUpdate={updateBiography}
                />
            </div>
        </div>
    );
}
