'use client';

import { useState } from 'react';
import {
    Check,
    X,
    HelpCircle,
    Clock,
    UserPlus,
    Trash2,
    Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { fetchApi } from '@/lib/api';
import { getFullName } from '@/features/family-tree/utils/tree-helpers';
import { RsvpStatus } from '@/types';
import type { GuestListWithEntries } from '../types';

type Props = {
    guestList: GuestListWithEntries;
    spaceId: string;
    weddingId: string;
    onUpdate: () => void;
};

const RSVP_CONFIG = {
    PENDING: { label: 'Pending', icon: Clock, color: 'bg-amber-100 text-amber-800' },
    CONFIRMED: { label: 'Confirmed', icon: Check, color: 'bg-green-100 text-green-800' },
    DECLINED: { label: 'Declined', icon: X, color: 'bg-red-100 text-red-800' },
    MAYBE: { label: 'Maybe', icon: HelpCircle, color: 'bg-blue-100 text-blue-800' },
};

export function GuestListPanel({ guestList, spaceId, weddingId, onUpdate }: Props) {
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleRsvpChange = async (entryId: string, status: RsvpStatus) => {
        setUpdatingId(entryId);
        try {
            await fetchApi(
                `/api/family-spaces/${spaceId}/weddings/${weddingId}/guest-lists/${guestList.id}/entries/${entryId}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({ rsvpStatus: status }),
                }
            );
            onUpdate();
        } catch (error) {
            console.error('Failed to update RSVP:', error);
        } finally {
            setUpdatingId(null);
        }
    };

    const handlePlusOneToggle = async (entryId: string, currentValue: boolean) => {
        setUpdatingId(entryId);
        try {
            await fetchApi(
                `/api/family-spaces/${spaceId}/weddings/${weddingId}/guest-lists/${guestList.id}/entries/${entryId}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({ plusOne: !currentValue }),
                }
            );
            onUpdate();
        } catch (error) {
            console.error('Failed to toggle plus one:', error);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (entryId: string) => {
        if (!confirm('Remove this guest from the list?')) return;

        setDeletingId(entryId);
        try {
            await fetchApi(
                `/api/family-spaces/${spaceId}/weddings/${weddingId}/guest-lists/${guestList.id}/entries/${entryId}`,
                { method: 'DELETE' }
            );
            onUpdate();
        } catch (error) {
            console.error('Failed to remove guest:', error);
        } finally {
            setDeletingId(null);
        }
    };

    // Empty state
    if (guestList.entries.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <UserPlus className="h-12 w-12 mb-4" />
                <p className="text-lg font-medium">No guests in this list yet</p>
                <p className="text-sm">Add guests from your family tree or manually.</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>RSVP Status</TableHead>
                        <TableHead>Plus One</TableHead>
                        <TableHead>Dietary</TableHead>
                        <TableHead>Table</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {guestList.entries.map((entry) => {
                        const name = entry.person
                            ? getFullName(entry.person)
                            : entry.manualName || 'Unknown';

                        const contact = entry.person
                            ? entry.person.status === 'CLAIMED'
                                ? 'Via app'
                                : '-'
                            : entry.manualEmail || entry.manualPhone || '-';

                        const rsvpConfig = RSVP_CONFIG[entry.rsvpStatus];
                        const Icon = rsvpConfig.icon;

                        return (
                            <TableRow key={entry.id}>
                                {/* Name */}
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        {name}
                                        {entry.person && (
                                            <Badge variant="outline" className="text-xs">
                                                Family
                                            </Badge>
                                        )}
                                    </div>
                                    {entry.plusOne && entry.plusOneName && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            +1: {entry.plusOneName}
                                        </p>
                                    )}
                                </TableCell>

                                {/* Contact */}
                                <TableCell className="text-slate-500 text-sm">
                                    {contact}
                                </TableCell>

                                {/* RSVP Status */}
                                <TableCell>
                                    <Select
                                        value={entry.rsvpStatus}
                                        onValueChange={(value) =>
                                            handleRsvpChange(entry.id, value as RsvpStatus)
                                        }
                                        disabled={updatingId === entry.id}
                                    >
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue>
                                                <div className="flex items-center gap-2">
                                                    {updatingId === entry.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Icon className="h-4 w-4" />
                                                    )}
                                                    {rsvpConfig.label}
                                                </div>
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(RSVP_CONFIG).map(([status, config]) => {
                                                const StatusIcon = config.icon;
                                                return (
                                                    <SelectItem key={status} value={status}>
                                                        <div className="flex items-center gap-2">
                                                            <StatusIcon className="h-4 w-4" />
                                                            {config.label}
                                                        </div>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </TableCell>

                                {/* Plus One */}
                                <TableCell>
                                    <Button
                                        variant={entry.plusOne ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handlePlusOneToggle(entry.id, entry.plusOne)}
                                        disabled={updatingId === entry.id}
                                    >
                                        {updatingId === entry.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : entry.plusOne ? (
                                            <>
                                                <UserPlus className="h-4 w-4 mr-1" />
                                                Yes
                                            </>
                                        ) : (
                                            'No'
                                        )}
                                    </Button>
                                </TableCell>

                                {/* Dietary Restrictions */}
                                <TableCell className="text-sm text-slate-500 max-w-[150px] truncate">
                                    {entry.dietaryRestrictions || '-'}
                                </TableCell>

                                {/* Table Assignment */}
                                <TableCell className="text-sm text-slate-500">
                                    {entry.tableAssignment || '-'}
                                </TableCell>

                                {/* Delete Button */}
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => handleDelete(entry.id)}
                                        disabled={deletingId === entry.id}
                                    >
                                        {deletingId === entry.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
