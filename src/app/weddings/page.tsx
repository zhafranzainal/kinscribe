'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import {
    Heart,
    Plus,
    Calendar,
    Users,
    Loader2,
    ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchApi } from '@/lib/api';
import { getFullName } from '@/features/family-tree/utils/tree-helpers';
import { CreateWeddingDialog } from '@/features/wedding/components/create-wedding-dialog';
import type { Person } from '@/types';

type WeddingWithCounts = {
    id: string;
    name: string;
    date: string | null;
    venue: string | null;
    person1: Person;
    person2: Person;
    guestLists: { _count: { entries: number } }[];
};

export default function WeddingsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const spaceId = searchParams.get('spaceId');

    const [weddings, setWeddings] = useState<WeddingWithCounts[]>([]);
    const [persons, setPersons] = useState<Person[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    useEffect(() => {
        if (!spaceId) return;

        async function fetchData() {
            setIsLoading(true);
            try {
                const [weddingsData, personsData] = await Promise.all([
                    fetchApi<WeddingWithCounts[]>(`/api/family-spaces/${spaceId}/weddings`),
                    fetchApi<Person[]>(`/api/family-spaces/${spaceId}/persons`),
                ]);
                setWeddings(weddingsData);
                setPersons(personsData);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [spaceId]);

    const refetch = async () => {
        if (!spaceId) return;
        const data = await fetchApi<WeddingWithCounts[]>(
            `/api/family-spaces/${spaceId}/weddings`
        );
        setWeddings(data);
    };

    if (!spaceId) {
        return (
            <div className="h-screen flex items-center justify-center">
                <p className="text-slate-500">Missing space ID</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    const getTotalGuests = (wedding: WeddingWithCounts) => {
        return wedding.guestLists.reduce((sum, list) => sum + list._count.entries, 0);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="border-b bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Wedding Events</h1>
                            <p className="text-sm text-slate-500">Plan and manage your wedding guest lists</p>
                        </div>
                    </div>

                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Wedding
                    </Button>
                </div>
            </header>

            {/* Content */}
            <main className="p-6">
                {weddings.length === 0 ? (
                    <Card className="max-w-md mx-auto mt-12">
                        <CardContent className="pt-6 text-center">
                            <Heart className="h-12 w-12 text-pink-300 mx-auto mb-4" />
                            <h2 className="text-lg font-semibold mb-2">No Weddings Yet</h2>
                            <p className="text-slate-500 mb-4">
                                Create a wedding event to start managing your guest list.
                            </p>
                            <Button onClick={() => setCreateDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Wedding
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {weddings.map((wedding) => (
                            <Card
                                key={wedding.id}
                                className="cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() =>
                                    router.push(`/wedding/${wedding.id}?spaceId=${spaceId}`)
                                }
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2 text-pink-500 mb-1">
                                        <Heart className="h-4 w-4" />
                                    </div>
                                    <CardTitle className="text-lg">{wedding.name}</CardTitle>
                                    <p className="text-sm text-slate-500">
                                        {getFullName(wedding.person1)} & {getFullName(wedding.person2)}
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        {wedding.date && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {format(new Date(wedding.date), 'MMM d, yyyy')}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            {getTotalGuests(wedding)} guests
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            {/* Create Dialog */}
            <CreateWeddingDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                persons={persons}
                spaceId={spaceId}
                onSuccess={refetch}
            />
        </div>
    );
}
