import type { Person, Relationship } from '@/types';

// For React Flow nodes
export type PersonNode = {
    id: string;
    type: 'person';
    position: { x: number; y: number };
    data: PersonNodeData;
};

export type PersonNodeData = {
    person: Person;
    isSelected: boolean;
    onSelect: (personId: string) => void;
    onAddRelative: (personId: string, relationType: AddRelativeType) => void;
    onEdit?: (personId: string) => void;
    onDelete?: (personId: string) => void;
    onViewBiography?: (personId: string) => void;
};

export type AddRelativeType =
    | 'father'
    | 'mother'
    | 'spouse'
    | 'son'
    | 'daughter'
    | 'brother'
    | 'sister';

// For React Flow edges
export type RelationshipEdge = {
    id: string;
    source: string;
    target: string;
    type: 'smoothstep';
    data: {
        relationship: Relationship;
    };
};

// Tree layout helpers
export type FamilyTreeData = {
    persons: Person[];
    relationships: Relationship[];
};

export type TreePosition = {
    personId: string;
    x: number;
    y: number;
    generation: number; // 0 = self, -1 = parents, -2 = grandparents, 1 = children
};
