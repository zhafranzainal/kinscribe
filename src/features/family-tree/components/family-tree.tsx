'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { PersonNode } from './person-node';
import { AddPersonDialog, type AddPersonFormData } from './add-person-dialog';
import { PersonDetailPanel } from './person-detail-panel';
import { DeletePersonDialog } from './delete-person-dialog';
import { useFamilyTreeStore } from '../hooks/use-family-tree-store';
import { useCreatePerson, useCreateRelationship } from '../hooks/use-family-space';
import { calculateTreeLayout } from '../utils/tree-layout';
import { getFullName } from '../utils/tree-helpers';
import type { AddRelativeType } from '../types';

const nodeTypes = {
    person: PersonNode,
};

type FamilyTreeProps = {
    spaceId: string;
};

export function FamilyTree({ spaceId }: FamilyTreeProps) {
    const router = useRouter();
    const {
        persons,
        relationships,
        selectedPersonId,
        selectPerson,
    } = useFamilyTreeStore();

    const { createPerson, isLoading: isCreatingPerson } = useCreatePerson(spaceId);
    const { createRelationship, isLoading: isCreatingRelationship } = useCreateRelationship(spaceId);

    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [addingRelativeTo, setAddingRelativeTo] = useState<string | null>(null);
    const [addingRelationType, setAddingRelationType] = useState<AddRelativeType | null>(null);

    // Delete dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [personToDelete, setPersonToDelete] = useState<string | null>(null);

    // Edit mode state (opens side panel in edit mode)
    const [editingPersonId, setEditingPersonId] = useState<string | null>(null);

    // Handle node selection
    const handleSelect = useCallback(
        (personId: string) => {
            selectPerson(personId);
            setEditingPersonId(null); // Reset edit mode when selecting new person
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

    // Handle edit from context menu
    const handleEdit = useCallback(
        (personId: string) => {
            selectPerson(personId);
            setEditingPersonId(personId);
        },
        [selectPerson]
    );

    // Handle delete from context menu
    const handleDelete = useCallback((personId: string) => {
        setPersonToDelete(personId);
        setDeleteDialogOpen(true);
    }, []);

    // Handle view biography from context menu
    const handleViewBiography = useCallback(
        (personId: string) => {
            router.push(`/biography/${personId}?spaceId=${spaceId}`);
        },
        [router, spaceId]
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
            onEdit: handleEdit,
            onDelete: handleDelete,
            onViewBiography: handleViewBiography,
            selectedPersonId,
        });
    }, [
        persons,
        relationships,
        selectedPersonId,
        handleSelect,
        handleAddRelative,
        handleEdit,
        handleDelete,
        handleViewBiography,
    ]);

    const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

    // Update nodes/edges when layout changes
    useMemo(() => {
        setNodes(layoutNodes);
        setEdges(layoutEdges);
    }, [layoutNodes, layoutEdges, setNodes, setEdges]);

    // Handle form submit
    const handleAddPersonSubmit = useCallback(
        async (formData: AddPersonFormData) => {
            try {
                // Create person via API
                const newPerson = await createPerson({
                    firstName: formData.firstName,
                    lastName: formData.lastName || null,
                    gender: formData.gender,
                    birthDate: formData.birthDate || null,
                });

                // Create relationship if adding relative
                if (addingRelativeTo && addingRelationType && newPerson) {
                    const relationshipData = getRelationshipData(
                        addingRelativeTo,
                        newPerson.id,
                        addingRelationType
                    );

                    if (relationshipData) {
                        await createRelationship(relationshipData);
                    }
                }

                // Close dialog
                setDialogOpen(false);
                setAddingRelativeTo(null);
                setAddingRelationType(null);
            } catch (error) {
                console.error('Failed to add person:', error);
                // TODO: Show error toast
            }
        },
        [createPerson, createRelationship, addingRelativeTo, addingRelationType]
    );

    // Helper to get relationship data based on type
    const getRelationshipData = (
        existingPersonId: string,
        newPersonId: string,
        relationType: AddRelativeType
    ): { type: 'PARENT_CHILD' | 'SPOUSE'; person1Id: string; person2Id: string } | null => {
        switch (relationType) {
            case 'father':
            case 'mother':
                return {
                    type: 'PARENT_CHILD',
                    person1Id: newPersonId, // Parent
                    person2Id: existingPersonId, // Child
                };
            case 'son':
            case 'daughter':
                return {
                    type: 'PARENT_CHILD',
                    person1Id: existingPersonId, // Parent
                    person2Id: newPersonId, // Child
                };
            case 'spouse':
                return {
                    type: 'SPOUSE',
                    person1Id: existingPersonId,
                    person2Id: newPersonId,
                };
            case 'brother':
            case 'sister':
                // TODO: Handle siblings (need to find/create common parent)
                return null;
            default:
                return null;
        }
    };

    const relativeToName = addingRelativeTo
        ? getFullName(persons.find((p) => p.id === addingRelativeTo)!)
        : '';

    const selectedPerson = persons.find((p) => p.id === selectedPersonId);
    const personToDeleteData = persons.find((p) => p.id === personToDelete);

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
                    spaceId={spaceId}
                    onClose={() => {
                        selectPerson(null);
                        setEditingPersonId(null);
                    }}
                    initialEditMode={editingPersonId === selectedPerson.id}
                />
            )}

            {/* Add person dialog */}
            <AddPersonDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                relationType={addingRelationType}
                relativeToName={relativeToName}
                onSubmit={handleAddPersonSubmit}
                isLoading={isCreatingPerson || isCreatingRelationship}
            />

            {/* Delete confirmation dialog */}
            <DeletePersonDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                person={personToDeleteData || null}
                spaceId={spaceId}
            />
        </div>
    );
}
