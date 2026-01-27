'use client';

import { useEffect, useState } from 'react';
import { FamilyTree } from '@/features/family-tree/components';
import { useFamilySpace } from '@/features/family-tree/hooks/use-family-space';
import { useFamilyTreeStore } from '@/features/family-tree/hooks/use-family-tree-store';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function Home() {
  const [spaceId, setSpaceId] = useState<string | null>(null);
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);

  const { space, isLoading, error } = useFamilySpace(spaceId);
  const { persons, selectPerson } = useFamilyTreeStore();

  // On mount, try to get or create a family space
  useEffect(() => {
    async function initSpace() {
      try {
        // Try to get existing spaces
        const spaces = await fetchApi<any[]>('/api/family-spaces');

        if (spaces.length > 0) {
          setSpaceId(spaces[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch spaces:', err);
      }
    }

    initSpace();
  }, []);

  // Select first person when data loads
  useEffect(() => {
    if (persons.length > 0 && !useFamilyTreeStore.getState().selectedPersonId) {
      selectPerson(persons[0].id);
    }
  }, [persons, selectPerson]);

  // Create new family space
  const handleCreateSpace = async () => {
    setIsCreatingSpace(true);
    try {
      const newSpace = await fetchApi<any>('/api/family-spaces', {
        method: 'POST',
        body: JSON.stringify({
          name: 'My Family',
          slug: `family-${Date.now()}`,
        }),
      });
      setSpaceId(newSpace.id);
    } catch (err) {
      console.error('Failed to create space:', err);
    } finally {
      setIsCreatingSpace(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <main className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </main>
    );
  }

  // No space yet - show welcome screen
  if (!spaceId) {
    return (
      <main className="h-screen flex flex-col items-center justify-center gap-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome to Kinscribe</h1>
          <p className="text-slate-500">Document your family's stories. Preserve your legacy.</p>
        </div>

        <Button size="lg" onClick={handleCreateSpace} disabled={isCreatingSpace}>
          {isCreatingSpace ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Your Family Tree
            </>
          )}
        </Button>
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kinscribe</h1>
          <p className="text-sm text-slate-500">{space?.name || 'Family Tree'}</p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">
            {persons.length} {persons.length === 1 ? 'person' : 'people'}
          </span>
        </div>
      </header>

      {/* Family Tree */}
      <div className="flex-1">
        {persons.length === 0 ? (
          <EmptyState spaceId={spaceId} />
        ) : (
          <FamilyTree spaceId={spaceId} />
        )}
      </div>
    </main>
  );
}

// Empty state when no persons yet
function EmptyState({ spaceId }: { spaceId: string }) {
  const [isAdding, setIsAdding] = useState(false);
  const { addPerson } = useFamilyTreeStore();

  const handleAddFirstPerson = async () => {
    setIsAdding(true);
    try {
      const person = await fetchApi<any>(`/api/family-spaces/${spaceId}/persons`, {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'Me',
          lastName: '',
        }),
      });
      addPerson(person);
    } catch (err) {
      console.error('Failed to add person:', err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Your tree is empty</h2>
        <p className="text-slate-500">Start by adding yourself or a family member</p>
      </div>

      <Button onClick={handleAddFirstPerson} disabled={isAdding}>
        {isAdding ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Add First Person
          </>
        )}
      </Button>
    </div>
  );
}
