'use client';

import { useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { fetchApi } from '@/lib/api';
import { useFamilyTreeStore } from '../hooks/use-family-tree-store';
import { getFullName } from '../utils/tree-helpers';
import type { Person } from '@/types';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    person: Person | null;
    spaceId: string;
};

export function DeletePersonDialog({
    open,
    onOpenChange,
    person,
    spaceId,
}: Props) {
    const [isDeleting, setIsDeleting] = useState(false);
    const { removePerson, selectPerson, selectedPersonId } = useFamilyTreeStore();

    if (!person) return null;

    const fullName = getFullName(person);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await fetchApi(`/api/family-spaces/${spaceId}/persons/${person.id}`, {
                method: 'DELETE',
            });

            removePerson(person.id);

            // Clear selection if we deleted the selected person
            if (selectedPersonId === person.id) {
                selectPerson(null);
            }

            onOpenChange(false);
        } catch (error) {
            console.error('Failed to delete person:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete {fullName}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete this person and all their relationships
                        from the family tree. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-500 hover:bg-red-600"
                    >
                        {isDeleting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
