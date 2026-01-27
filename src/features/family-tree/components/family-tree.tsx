'use client';

import { useCallback, useMemo, useState } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    type Node,
    type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { PersonNode } from './person-node';
import { AddPersonDialog, type AddPersonFormData } from './add-person-dialog';
import { PersonDetailPanel } from './person-detail-panel';
import { useFamilyTreeStore } from '../hooks/use-family-tree-store';
import { calculateTreeLayout } from '../utils/tree-layout';
import { getFullName } from '../utils/tree-helpers';
import type { AddRelativeType } from '../types';

const nodeTypes = {
    person: PersonNode,
};

export function FamilyTree() {
    const {
        persons,
        relationships,
        selectedPersonId,
        selectPerson,
        addPerson,
        addRelationship,
    } = useFamilyTreeStore();

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [addingRelativeTo, setAddingRelativeTo] = useState<string | null>(null);
    const [addingRelationType, setAddingRelationType] = useState<AddRelativeType | null>(null);

    // Handle node selection
    const handleSelect = useCallback(
        (personId: string) => {
            selectPerson(personId);
        },
        [selectPerson]
    );

    // Handle add relative from context menu
    const handleAddRelative = useCallback(
        (personId: string, relationType: AddRelativeType) => {
            setAddingRelativeTo(personId);
            setAddingRelationType(relationType);
            setDialogOpen(true);
        },
        []
    );

    // Calculate layout
    const { nodes: layoutNodes, edges: layoutEdges } = useMemo(() => {
        if (persons.length === 0) {
            return { nodes: [], edges: [] };
        }

        const rootId = selectedPersonId || persons[0]?.id;
        if (!rootId) return { nodes: [], edges: [] };

        return calculateTreeLayout({
            rootPersonId: rootId,
            persons,
            relationships,
            onSelect: handleSelect,
            onAddRelative: handleAddRelative,
            selectedPersonId,
        });
    }, [persons, relationships, selectedPersonId, handleSelect, handleAddRelative]);

    const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

    // Update nodes/edges when layout changes
    useMemo(() => {
        setNodes(layoutNodes);
        setEdges(layoutEdges);
    }, [layoutNodes, layoutEdges, setNodes, setEdges]);

    // Handle form submit
    const handleAddPersonSubmit = useCallback(
        (formData: AddPersonFormData) => {
            // Generate temporary ID (in real app, this comes from API)
            const newPersonId = `temp-${Date.now()}`;

            const newPerson = {
                id: newPersonId,
                firstName: formData.firstName,
                lastName: formData.lastName || null,
                gender: formData.gender,
                birthDate: formData.birthDate ? new Date(formData.birthDate) : null,
                deathDate: null,
                birthPlace: null,
                profilePhotoUrl: null,
                bio: null,
                status: 'UNCLAIMED' as const,
                inviteEmail: null,
                invitedAt: null,
                familySpaceId: 'temp-space', // Will be real in actual app
                claimedByUserId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            addPerson(newPerson);

            // Add relationship if adding relative
            if (addingRelativeTo && addingRelationType) {
                const relationship = createRelationship(
                    addingRelativeTo,
                    newPersonId,
                    addingRelationType
                );
                if (relationship) {
                    addRelationship(relationship);
                }
            }

            // Close dialog
            setDialogOpen(false);
            setAddingRelativeTo(null);
            setAddingRelationType(null);
        },
        [addPerson, addRelationship, addingRelativeTo, addingRelationType]
    );

    // Helper to create relationship based on type
    const createRelationship = (
        existingPersonId: string,
        newPersonId: string,
        relationType: AddRelativeType
    ) => {
        const baseRelationship = {
            id: `rel-${Date.now()}`,
            familySpaceId: 'temp-space',
            marriageDate: null,
            divorceDate: null,
            createdAt: new Date(),
        };

        switch (relationType) {
            case 'father':
            case 'mother':
                return {
                    ...baseRelationship,
                    type: 'PARENT_CHILD' as const,
                    person1Id: newPersonId, // Parent
                    person2Id: existingPersonId, // Child
                };
            case 'son':
            case 'daughter':
                return {
                    ...baseRelationship,
                    type: 'PARENT_CHILD' as const,
                    person1Id: existingPersonId, // Parent
                    person2Id: newPersonId, // Child
                };
            case 'spouse':
                return {
                    ...baseRelationship,
                    type: 'SPOUSE' as const,
                    person1Id: existingPersonId,
                    person2Id: newPersonId,
                };
            case 'brother':
            case 'sister':
                // For siblings, we need to find a common parent
                // For now, we'll skip automatic sibling connection
                // This requires more complex logic
                return null;
            default:
                return null;
        }
    };

    const relativeToName = addingRelativeTo
        ? getFullName(persons.find((p) => p.id === addingRelativeTo)!)
        : '';

    const selectedPerson = persons.find((p) => p.id === selectedPersonId);

    return (
        <div className="flex h-full w-full">
            {/* Main tree canvas */}
            <div className="flex-1 h-full">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    minZoom={0.1}
                    maxZoom={2}
                >
                    <Background color="#e2e8f0" gap={20} />
                    <Controls />
                    <MiniMap
                        nodeColor={(node) => {
                            const person = (node.data as any)?.person;
                            if (person?.gender === 'MALE') return '#93c5fd';
                            if (person?.gender === 'FEMALE') return '#f9a8d4';
                            return '#cbd5e1';
                        }}
                    />
                </ReactFlow>
            </div>

            {/* Side panel */}
            {selectedPerson && (
                <PersonDetailPanel
                    person={selectedPerson}
                    onClose={() => selectPerson(null)}
                />
            )}

            {/* Add person dialog */}
            <AddPersonDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                relationType={addingRelationType}
                relativeToName={relativeToName}
                onSubmit={handleAddPersonSubmit}
            />
        </div>
    );
}
