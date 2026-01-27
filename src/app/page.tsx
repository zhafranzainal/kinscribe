'use client';

import { useEffect } from 'react';
import { FamilyTree } from '@/features/family-tree/components';
import { useFamilyTreeStore } from '@/features/family-tree/hooks/use-family-tree-store';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// Demo data for testing
const DEMO_PERSONS = [
  {
    id: '1',
    firstName: 'Ahmad',
    lastName: 'Rahman',
    gender: 'MALE' as const,
    birthDate: new Date('1990-05-15'),
    deathDate: null,
    birthPlace: 'Kuala Lumpur',
    profilePhotoUrl: null,
    bio: 'Software Engineer',
    status: 'CLAIMED' as const,
    inviteEmail: null,
    invitedAt: null,
    familySpaceId: 'space-1',
    claimedByUserId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    firstName: 'Hassan',
    lastName: 'Rahman',
    gender: 'MALE' as const,
    birthDate: new Date('1960-03-20'),
    deathDate: null,
    birthPlace: 'Penang',
    profilePhotoUrl: null,
    bio: 'Retired Teacher',
    status: 'UNCLAIMED' as const,
    inviteEmail: null,
    invitedAt: null,
    familySpaceId: 'space-1',
    claimedByUserId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    firstName: 'Fatimah',
    lastName: 'Abdullah',
    gender: 'FEMALE' as const,
    birthDate: new Date('1965-08-10'),
    deathDate: null,
    birthPlace: 'Johor',
    profilePhotoUrl: null,
    bio: 'Homemaker',
    status: 'UNCLAIMED' as const,
    inviteEmail: null,
    invitedAt: null,
    familySpaceId: 'space-1',
    claimedByUserId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const DEMO_RELATIONSHIPS = [
  {
    id: 'rel-1',
    type: 'PARENT_CHILD' as const,
    person1Id: '2', // Hassan is parent
    person2Id: '1', // of Ahmad
    marriageDate: null,
    divorceDate: null,
    familySpaceId: 'space-1',
    createdAt: new Date(),
  },
  {
    id: 'rel-2',
    type: 'PARENT_CHILD' as const,
    person1Id: '3', // Fatimah is parent
    person2Id: '1', // of Ahmad
    marriageDate: null,
    divorceDate: null,
    familySpaceId: 'space-1',
    createdAt: new Date(),
  },
  {
    id: 'rel-3',
    type: 'SPOUSE' as const,
    person1Id: '2', // Hassan
    person2Id: '3', // & Fatimah
    marriageDate: new Date('1988-01-15'),
    divorceDate: null,
    familySpaceId: 'space-1',
    createdAt: new Date(),
  },
];

export default function Home() {
  const { setPersons, setRelationships, selectPerson, persons } = useFamilyTreeStore();

  // Load demo data on mount
  useEffect(() => {
    setPersons(DEMO_PERSONS);
    setRelationships(DEMO_RELATIONSHIPS);
    selectPerson('1'); // Select Ahmad as root
  }, [setPersons, setRelationships, selectPerson]);

  return (
    <main className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kinscribe</h1>
          <p className="text-sm text-slate-500">Rahman Family Tree</p>
        </div>

        <div className="flex items-center gap-4">
          {persons.length === 0 && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add First Person
            </Button>
          )}
        </div>
      </header>

      {/* Family Tree */}
      <div className="flex-1">
        <FamilyTree />
      </div>
    </main>
  );
}
