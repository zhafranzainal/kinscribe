'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, MapPin, Trash2, Edit, Save, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { fetchApi } from '@/lib/api';
import type { BiographyEntry as BiographyEntryType } from '@/types';
import type { BiographyWithSections } from '../types';

type Props = {
    entry: BiographyEntryType;
    spaceId: string;
    personId: string;
    subsectionId: string;
    onUpdate: (biography: BiographyWithSections) => void;
};

export function BiographyEntry({
    entry,
    spaceId,
    personId,
    subsectionId,
    onUpdate,
}: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [formData, setFormData] = useState({
        title: entry.title || '',
        content: entry.content || '',
        date: entry.date ? format(new Date(entry.date), 'yyyy-MM-dd') : '',
        location: entry.location || '',
    });

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await fetchApi(
                `/api/family-spaces/${spaceId}/persons/${personId}/biography/subsections/${subsectionId}/entries/${entry.id}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        title: formData.title || null,
                        content: formData.content || null,
                        date: formData.date || null,
                        location: formData.location || null,
                    }),
                }
            );

            const updated = await fetchApi<BiographyWithSections>(
                `/api/family-spaces/${spaceId}/persons/${personId}/biography`
            );
            onUpdate(updated);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save entry:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this entry?')) return;

        setIsDeleting(true);
        try {
            await fetchApi(
                `/api/family-spaces/${spaceId}/persons/${personId}/biography/subsections/${subsectionId}/entries/${entry.id}`,
                { method: 'DELETE' }
            );

            const updated = await fetchApi<BiographyWithSections>(
                `/api/family-spaces/${spaceId}/persons/${personId}/biography`
            );
            onUpdate(updated);
        } catch (error) {
            console.error('Failed to delete entry:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    if (isEditing) {
        return (
            <Card>
                <CardContent className="p-4 space-y-4">
                    <Input
                        placeholder="Entry title"
                        value={formData.title}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, title: e.target.value }))
                        }
                    />

                    <Textarea
                        placeholder="Write about this memory..."
                        value={formData.content}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, content: e.target.value }))
                        }
                        className="min-h-[100px]"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-slate-500 mb-1 block">Date</label>
                            <Input
                                type="date"
                                value={formData.date}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                                }
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-500 mb-1 block">Location</label>
                            <Input
                                placeholder="Where did this happen?"
                                value={formData.location}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, location: e.target.value }))
                                }
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Save
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="group">
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        {entry.title && (
                            <h4 className="font-medium text-slate-800 mb-1">{entry.title}</h4>
                        )}

                        {entry.content && (
                            <p className="text-slate-600 text-sm whitespace-pre-wrap mb-2">
                                {entry.content}
                            </p>
                        )}

                        <div className="flex gap-4 text-xs text-slate-400">
                            {entry.date && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(entry.date), 'MMMM d, yyyy')}
                                </span>
                            )}
                            {entry.location && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {entry.location}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => setIsEditing(true)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
