'use client';

import { useState } from 'react';
import { Loader2, User, UserPlus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchApi } from '@/lib/api';
import { getFullName } from '@/features/family-tree/utils/tree-helpers';
import type { Person } from '@/types';
import type { GuestListWithEntries } from '../types';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    guestLists: GuestListWithEntries[];
    persons: Person[];
    existingGuestIds: string[];
    spaceId: string;
    weddingId: string;
    onSuccess: () => void;
};

export function AddGuestDialog({
    open,
    onOpenChange,
    guestLists,
    persons,
    existingGuestIds,
    spaceId,
    weddingId,
    onSuccess,
}: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedListId, setSelectedListId] = useState(guestLists[0]?.id || '');

    // From family tree
    const [selectedPersonId, setSelectedPersonId] = useState('');

    // Manual entry
    const [manualName, setManualName] = useState('');
    const [manualEmail, setManualEmail] = useState('');
    const [manualPhone, setManualPhone] = useState('');

    // Filter out already added persons
    const availablePersons = persons.filter(
        (p) => !existingGuestIds.includes(p.id)
    );

    const handleAddFromTree = async () => {
        if (!selectedPersonId || !selectedListId) return;

        setIsLoading(true);
        try {
            await fetchApi(
                `/api/family-spaces/${spaceId}/weddings/${weddingId}/guest-lists/${selectedListId}/entries`,
                {
                    method: 'POST',
                    body: JSON.stringify({ personId: selectedPersonId }),
                }
            );

            onSuccess();
            onOpenChange(false);
            resetForm();
        } catch (error) {
            console.error('Failed to add guest:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddManual = async () => {
        if (!manualName || !selectedListId) return;

        setIsLoading(true);
        try {
            await fetchApi(
                `/api/family-spaces/${spaceId}/weddings/${weddingId}/guest-lists/${selectedListId}/entries`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        manualName,
                        manualEmail: manualEmail || undefined,
                        manualPhone: manualPhone || undefined,
                    }),
                }
            );

            onSuccess();
            onOpenChange(false);
            resetForm();
        } catch (error) {
            console.error('Failed to add guest:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedPersonId('');
        setManualName('');
        setManualEmail('');
        setManualPhone('');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Guest</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Guest List Selection */}
                    <div className="space-y-2">
                        <Label>Add to List</Label>
                        <Select value={selectedListId} onValueChange={setSelectedListId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a list" />
                            </SelectTrigger>
                            <SelectContent>
                                {guestLists.map((list) => (
                                    <SelectItem key={list.id} value={list.id}>
                                        {list.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Tabs defaultValue="family" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="family">
                                <User className="h-4 w-4 mr-2" />
                                From Family Tree
                            </TabsTrigger>
                            <TabsTrigger value="manual">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add Manually
                            </TabsTrigger>
                        </TabsList>

                        {/* From Family Tree */}
                        <TabsContent value="family" className="space-y-4">
                            <div className="space-y-2">
                                <Label>Select Person</Label>
                                <Select
                                    value={selectedPersonId}
                                    onValueChange={setSelectedPersonId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose from family tree" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availablePersons.length === 0 ? (
                                            <div className="p-2 text-sm text-slate-500 text-center">
                                                All family members already added
                                            </div>
                                        ) : (
                                            availablePersons.map((person) => (
                                                <SelectItem key={person.id} value={person.id}>
                                                    {getFullName(person)}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                className="w-full"
                                onClick={handleAddFromTree}
                                disabled={!selectedPersonId || !selectedListId || isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <UserPlus className="h-4 w-4 mr-2" />
                                )}
                                Add Guest
                            </Button>
                        </TabsContent>

                        {/* Manual Entry */}
                        <TabsContent value="manual" className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="manualName">Name *</Label>
                                <Input
                                    id="manualName"
                                    value={manualName}
                                    onChange={(e) => setManualName(e.target.value)}
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="manualEmail">Email</Label>
                                <Input
                                    id="manualEmail"
                                    type="email"
                                    value={manualEmail}
                                    onChange={(e) => setManualEmail(e.target.value)}
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="manualPhone">Phone</Label>
                                <Input
                                    id="manualPhone"
                                    value={manualPhone}
                                    onChange={(e) => setManualPhone(e.target.value)}
                                    placeholder="+60 12-345 6789"
                                />
                            </div>

                            <Button
                                className="w-full"
                                onClick={handleAddManual}
                                disabled={!manualName || !selectedListId || isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <UserPlus className="h-4 w-4 mr-2" />
                                )}
                                Add Guest
                            </Button>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
