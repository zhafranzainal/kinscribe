import type { Person, Relationship } from '@/types';
import { RelationshipType } from '@/types';
import type { PersonNode, RelationshipEdge } from '../types';
import { getParents, getSpouses, getChildren } from './tree-helpers';

const NODE_WIDTH = 160;
const NODE_HEIGHT = 120;
const HORIZONTAL_SPACING = 50;
const VERTICAL_SPACING = 100;

type LayoutOptions = {
    rootPersonId: string;
    persons: Person[];
    relationships: Relationship[];
    onSelect: (personId: string) => void;
    onAddRelative: (personId: string, relationType: string) => void;
    onEdit?: (personId: string) => void;
    onDelete?: (personId: string) => void;
    onViewBiography?: (personId: string) => void;
    selectedPersonId: string | null;
};

export function calculateTreeLayout({
    rootPersonId,
    persons,
    relationships,
    onSelect,
    onAddRelative,
    onEdit,
    onDelete,
    onViewBiography,
    selectedPersonId,
}: LayoutOptions): { nodes: PersonNode[]; edges: RelationshipEdge[] } {
    const nodes: PersonNode[] = [];
    const edges: RelationshipEdge[] = [];
    const positionedIds = new Set<string>();

    const rootPerson = persons.find((p) => p.id === rootPersonId);
    if (!rootPerson) {
        return { nodes, edges };
    }

    // Position root at center
    const centerX = 400;
    const centerY = 300;

    // Helper to add a node
    const addNode = (person: Person, x: number, y: number) => {
        if (positionedIds.has(person.id)) return;
        positionedIds.add(person.id);

        nodes.push({
            id: person.id,
            type: 'person',
            position: { x, y },
            data: {
                person,
                isSelected: person.id === selectedPersonId,
                onSelect,
                onAddRelative,
                onEdit,
                onDelete,
                onViewBiography,
            },
        });
    };

    // Position root person
    addNode(rootPerson, centerX, centerY);

    // Position spouses
    const spouses = getSpouses(rootPersonId, relationships, persons);
    spouses.forEach((spouse, index) => {
        const x = centerX + (index + 1) * (NODE_WIDTH + HORIZONTAL_SPACING);
        addNode(spouse, x, centerY);

        // Add spouse edge
        edges.push({
            id: `spouse-${rootPersonId}-${spouse.id}`,
            source: rootPersonId,
            target: spouse.id,
            type: 'smoothstep',
            sourceHandle: 'spouse-left',
            targetHandle: 'spouse-right',
            data: {
                relationship: relationships.find(
                    (r) =>
                        r.type === RelationshipType.SPOUSE &&
                        ((r.person1Id === rootPersonId && r.person2Id === spouse.id) ||
                            (r.person2Id === rootPersonId && r.person1Id === spouse.id))
                )!,
            },
            style: { stroke: '#f472b6', strokeWidth: 2 },
        } as RelationshipEdge);
    });

    // Position parents
    const parents = getParents(rootPersonId, relationships, persons);
    parents.forEach((parent, index) => {
        const x = centerX + (index - 0.5) * (NODE_WIDTH + HORIZONTAL_SPACING);
        const y = centerY - VERTICAL_SPACING - NODE_HEIGHT;
        addNode(parent, x, y);

        // Add parent-child edge
        edges.push({
            id: `parent-${parent.id}-${rootPersonId}`,
            source: parent.id,
            target: rootPersonId,
            type: 'smoothstep',
            data: {
                relationship: relationships.find(
                    (r) =>
                        r.type === RelationshipType.PARENT_CHILD &&
                        r.person1Id === parent.id &&
                        r.person2Id === rootPersonId
                )!,
            },
            style: { stroke: '#94a3b8', strokeWidth: 2 },
        } as RelationshipEdge);
    });

    // Position children
    const children = getChildren(rootPersonId, relationships, persons);
    const childrenTotalWidth = children.length * (NODE_WIDTH + HORIZONTAL_SPACING) - HORIZONTAL_SPACING;
    const childrenStartX = centerX - childrenTotalWidth / 2 + NODE_WIDTH / 2;

    children.forEach((child, index) => {
        const x = childrenStartX + index * (NODE_WIDTH + HORIZONTAL_SPACING);
        const y = centerY + VERTICAL_SPACING + NODE_HEIGHT;
        addNode(child, x, y);

        // Add parent-child edge
        edges.push({
            id: `child-${rootPersonId}-${child.id}`,
            source: rootPersonId,
            target: child.id,
            type: 'smoothstep',
            data: {
                relationship: relationships.find(
                    (r) =>
                        r.type === RelationshipType.PARENT_CHILD &&
                        r.person1Id === rootPersonId &&
                        r.person2Id === child.id
                )!,
            },
            style: { stroke: '#94a3b8', strokeWidth: 2 },
        } as RelationshipEdge);
    });

    return { nodes, edges };
}
