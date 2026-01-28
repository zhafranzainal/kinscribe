'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Users,
    Loader2,
    Heart,
    Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchApi } from '@/lib/api';
import { getFullName } from '@/features/family-tree/utils/tree-helpers';
import type { WeddingEventWithDetails, GuestStats } from '../types';
import { GuestListPanel } from './guest-list-panel';
import { AddGuestDialog } from './add-guest-dialog';
import type { Person } from '@/types';


type Props = {
    weddingId: string;
    spaceId: string;
};

export function WeddingView({ weddingId, spaceId }: Props) {
    const router = useRouter();
    const [wedding, setWedding] = useState<WeddingEventWithDetails | null>(null);
    const [persons, setPersons] = useState<Person[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeListId, setActiveListId] = useState<string | null>(null);
    const [addGuestDialogOpen, setAddGuestDialogOpen] = useState(false);

    // Fetch wedding and persons
    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                const [weddingData, personsData] = await Promise.all([
                    fetchApi<WeddingEventWithDetails>(
                        `/api/family-spaces/${spaceId}/weddings/${weddingId}`
                    ),
                    fetchApi<Person[]>(`/api/family-spaces/${spaceId}/persons`),
                ]);

                setWedding(weddingData);
                setPersons(personsData);

                if (weddingData.guestLists.length > 0) {
                    setActiveListId(weddingData.guestLists[0].id);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [weddingId, spaceId]);

    // Calculate stats
    const calculateStats = (): GuestStats => {
        if (!wedding) {
            return { total: 0, confirmed: 0, declined: 0, pending: 0, maybe: 0, plusOnes: 0 };
        }

        const allEntries = wedding.guestLists.flatMap((list) => list.entries);

        return {
            total: allEntries.length,
            confirmed: allEntries.filter((e) => e.rsvpStatus === 'CONFIRMED').length,
            declined: allEntries.filter((e) => e.rsvpStatus === 'DECLINED').length,
            pending: allEntries.filter((e) => e.rsvpStatus === 'PENDING').length,
            maybe: allEntries.filter((e) => e.rsvpStatus === 'MAYBE').length,
            plusOnes: allEntries.filter((e) => e.plusOne).length,
        };
    };

    const stats = calculateStats();

    // Refetch wedding data
    const refetchWedding = async () => {
        try {
            const data = await fetchApi<WeddingEventWithDetails>(
                `/api/family-spaces/${spaceId}/weddings/${weddingId}`
            );
            setWedding(data);
        } catch (error) {
            console.error('Failed to refetch wedding:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!wedding) {
        return (
            <div className="h-screen flex items-center justify-center">
                <p className="text-slate-500">Wedding not found</p>
            </div>
        );
    }

    const activeList = wedding.guestLists.find((l) => l.id === activeListId);

    return (
        <div className="h-screen flex flex-col bg-slate-50">
            {/* Header */}
            <header className="border-b bg-white px-6 py-4">
                <div className="flex items-center gap-4 mb-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>

                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Heart className="h-5 w-5 text-pink-500" />
                            <h1 className="text-xl font-semibold">{wedding.name}</h1>
                        </div>
                        <p className="text-sm text-slate-500">
                            {getFullName(wedding.person1)} & {getFullName(wedding.person2)}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        {wedding.date && (
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(wedding.date), 'MMMM d, yyyy')}
                            </span>
                        )}
                        {wedding.venue && (
                            <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {wedding.venue}
                            </span>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-6 gap-4">
                    <StatsCard label="Total Guests" value={stats.total} />
                    <StatsCard label="Confirmed" value={stats.confirmed} className="text-green-600" />
                    <StatsCard label="Pending" value={stats.pending} className="text-amber-600" />
                    <StatsCard label="Maybe" value={stats.maybe} className="text-blue-600" />
                    <StatsCard label="Declined" value={stats.declined} className="text-red-600" />
                    <StatsCard label="Plus Ones" value={stats.plusOnes} className="text-purple-600" />
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden p-6">
                <Card className="h-full flex flex-col">
                    <CardHeader className="pb-0">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Guest Lists
                            </CardTitle>
                            <Button onClick={() => setAddGuestDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Guest
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-hidden pt-4">
                        <Tabs
                            value={activeListId || undefined}
                            onValueChange={setActiveListId}
                            className="h-full flex flex-col"
                        >
                            <TabsList className="mb-4">
                                {wedding.guestLists.map((list) => (
                                    <TabsTrigger key={list.id} value={list.id}>
                                        {list.name}
                                        <span className="ml-2 text-xs bg-slate-200 px-1.5 py-0.5 rounded-full">
                                            {list.entries.length}
                                        </span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {wedding.guestLists.map((list) => (
                                <TabsContent
                                    key={list.id}
                                    value={list.id}
                                    className="flex-1 overflow-hidden mt-0"
                                >
                                    <GuestListPanel
                                        guestList={list}
                                        spaceId={spaceId}
                                        weddingId={weddingId}
                                        onUpdate={refetchWedding}
                                    />
                                </TabsContent>
                            ))}
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            {/* Add Guest Dialog */}
            <AddGuestDialog
                open={addGuestDialogOpen}
                onOpenChange={setAddGuestDialogOpen}
                guestLists={wedding.guestLists}
                persons={persons}
                existingGuestIds={wedding.guestLists
                    .flatMap((l) => l.entries)
                    .map((e) => e.personId)
                    .filter((id): id is string => id !== null)}
                spaceId={spaceId}
                weddingId={weddingId}
                onSuccess={refetchWedding}
            />
        </div>
    );
}

// Stats card component
function StatsCard({
    label,
    value,
    className,
}: {
    label: string;
    value: number;
    className?: string;
}) {
    return (
        <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className={`text-2xl font-bold ${className || 'text-slate-900'}`}>
                {value}
            </p>
            <p className="text-xs text-slate-500">{label}</p>
        </div>
    );
}
