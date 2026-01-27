'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchApi } from '@/lib/api';
import { useFamilyTreeStore } from './use-family-tree-store';
import type { Person, Relationship, FamilySpace } from '@/types';

type FamilySpaceWithData = FamilySpace & {
    persons: Person[];
    relationships: Relationship[];
};

export function useFamilySpace(spaceId: string | null) {
    const [space, setSpace] = useState<FamilySpace | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { setPersons, setRelationships } = useFamilyTreeStore();

    // Fetch family space data
    const fetchSpace = useCallback(async () => {
        if (!spaceId) return;

        setIsLoading(true);
        setError(null);

        try {
            const data = await fetchApi<FamilySpaceWithData>(
                `/api/family-spaces/${spaceId}`
            );

            setSpace(data);
            setPersons(data.persons);
            setRelationships(data.relationships);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch');
        } finally {
            setIsLoading(false);
        }
    }, [spaceId, setPersons, setRelationships]);

    useEffect(() => {
        fetchSpace();
    }, [fetchSpace]);

    return {
        space,
        isLoading,
        error,
        refetch: fetchSpace,
    };
}

export function useCreatePerson(spaceId: string) {
    const [isLoading, setIsLoading] = useState(false);
    const { addPerson } = useFamilyTreeStore();

    const createPerson = useCallback(
        async (data: {
            firstName: string;
            lastName?: string | null;
            gender?: string | null;
            birthDate?: string | null;
        }) => {
            setIsLoading(true);

            try {
                const person = await fetchApi<Person>(
                    `/api/family-spaces/${spaceId}/persons`,
                    {
                        method: 'POST',
                        body: JSON.stringify(data),
                    }
                );

                addPerson(person);
                return person;
            } finally {
                setIsLoading(false);
            }
        },
        [spaceId, addPerson]
    );

    return { createPerson, isLoading };
}

export function useCreateRelationship(spaceId: string) {
    const [isLoading, setIsLoading] = useState(false);
    const { addRelationship } = useFamilyTreeStore();

    const createRelationship = useCallback(
        async (data: {
            type: 'PARENT_CHILD' | 'SPOUSE';
            person1Id: string;
            person2Id: string;
            marriageDate?: string | null;
        }) => {
            setIsLoading(true);

            try {
                const relationship = await fetchApi<Relationship>(
                    `/api/family-spaces/${spaceId}/relationships`,
                    {
                        method: 'POST',
                        body: JSON.stringify(data),
                    }
                );

                addRelationship(relationship);
                return relationship;
            } finally {
                setIsLoading(false);
            }
        },
        [spaceId, addRelationship]
    );

    return { createRelationship, isLoading };
}

export function useDeletePerson(spaceId: string) {
    const [isLoading, setIsLoading] = useState(false);
    const { removePerson } = useFamilyTreeStore();

    const deletePerson = useCallback(
        async (personId: string) => {
            setIsLoading(true);

            try {
                await fetchApi(`/api/family-spaces/${spaceId}/persons/${personId}`, {
                    method: 'DELETE',
                });

                removePerson(personId);
            } finally {
                setIsLoading(false);
            }
        },
        [spaceId, removePerson]
    );

    return { deletePerson, isLoading };
}
