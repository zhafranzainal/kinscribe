import { create } from 'zustand';
import type { Person, Relationship } from '@/types';

type FamilyTreeState = {
    // Data
    persons: Person[];
    relationships: Relationship[];

    // UI State
    selectedPersonId: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setPersons: (persons: Person[]) => void;
    setRelationships: (relationships: Relationship[]) => void;
    selectPerson: (personId: string | null) => void;
    addPerson: (person: Person) => void;
    updatePerson: (personId: string, updates: Partial<Person>) => void;
    removePerson: (personId: string) => void;
    addRelationship: (relationship: Relationship) => void;
    removeRelationship: (relationshipId: string) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
};

export const useFamilyTreeStore = create<FamilyTreeState>((set) => ({
    // Initial state
    persons: [],
    relationships: [],
    selectedPersonId: null,
    isLoading: false,
    error: null,

    // Actions
    setPersons: (persons) => set({ persons }),

    setRelationships: (relationships) => set({ relationships }),

    selectPerson: (personId) => set({ selectedPersonId: personId }),

    addPerson: (person) =>
        set((state) => ({ persons: [...state.persons, person] })),

    updatePerson: (personId, updates) =>
        set((state) => ({
            persons: state.persons.map((p) =>
                p.id === personId ? { ...p, ...updates } : p
            ),
        })),

    removePerson: (personId) =>
        set((state) => ({
            persons: state.persons.filter((p) => p.id !== personId),
            relationships: state.relationships.filter(
                (r) => r.person1Id !== personId && r.person2Id !== personId
            ),
            selectedPersonId:
                state.selectedPersonId === personId ? null : state.selectedPersonId,
        })),

    addRelationship: (relationship) =>
        set((state) => ({
            relationships: [...state.relationships, relationship],
        })),

    removeRelationship: (relationshipId) =>
        set((state) => ({
            relationships: state.relationships.filter((r) => r.id !== relationshipId),
        })),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),
}));
