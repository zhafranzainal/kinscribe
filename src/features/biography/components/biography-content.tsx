'use client';

import { useState } from 'react';
import { Plus, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { fetchApi } from '@/lib/api';
import { getSectionConfig } from '../constants/sections';
import type { SectionWithSubsections, BiographyWithSections } from '../types';
import { BiographyEntry } from './biography-entry';

type Props = {
    section: SectionWithSubsections | null;
    activeSubsectionId: string | null;
    spaceId: string;
    personId: string;
    onUpdate: (biography: BiographyWithSections) => void;
};

export function BiographyContent({
    section,
    activeSubsectionId,
    spaceId,
    personId,
    onUpdate,
}: Props) {
    const [isSaving, setIsSaving] = useState(false);
    const [editingContent, setEditingContent] = useState<string | null>(null);

    if (!section) {
        return (
            <main className="flex-1 flex items-center justify-center bg-white">
                <p className="text-slate-400">Select a section to view</p>
            </main>
        );
    }

    const config = getSectionConfig(section.sectionType);
    const activeSubsection = section.subsections.find(
        (s) => s.id === activeSubsectionId
    );

    // Save subsection content
    const handleSaveContent = async () => {
        if (!activeSubsection || editingContent === null) return;

        setIsSaving(true);
        try {
            await fetchApi(
                `/api/family-spaces/${spaceId}/persons/${personId}/biography/subsections/${activeSubsection.id}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({ content: editingContent }),
                }
            );

            // Refetch biography to update state
            const updated = await fetchApi<BiographyWithSections>(
                `/api/family-spaces/${spaceId}/persons/${personId}/biography`
            );
            onUpdate(updated);
            setEditingContent(null);
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Add new entry
    const handleAddEntry = async () => {
        if (!activeSubsection) return;

        try {
            await fetchApi(
                `/api/family-spaces/${spaceId}/persons/${personId}/biography/subsections/${activeSubsection.id}/entries`,
                {
                    method: 'POST',
                    body: JSON.stringify({ title: 'New Entry' }),
                }
            );

            // Refetch biography
            const updated = await fetchApi<BiographyWithSections>(
                `/api/family-spaces/${spaceId}/persons/${personId}/biography`
            );
            onUpdate(updated);
        } catch (error) {
            console.error('Failed to add entry:', error);
        }
    };

    return (
        <main className="flex-1 overflow-y-auto bg-white">
            <div className="max-w-3xl mx-auto p-8">
                {/* Section header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{config?.icon}</span>
                        <h1 className="text-2xl font-bold text-slate-900">{config?.label}</h1>
                    </div>
                    <p className="text-slate-500">{config?.description}</p>
                </div>

                {/* Subsection content */}
                {activeSubsection && (
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">
                            {activeSubsection.title}
                        </h2>

                        {/* Main content area */}
                        <div className="mb-6">
                            {editingContent !== null ? (
                                <div className="space-y-3">
                                    <Textarea
                                        value={editingContent}
                                        onChange={(e) => setEditingContent(e.target.value)}
                                        placeholder="Write your story here..."
                                        className="min-h-[200px]"
                                    />
                                    <div className="flex gap-2">
                                        <Button onClick={handleSaveContent} disabled={isSaving}>
                                            {isSaving ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4 mr-2" />
                                            )}
                                            Save
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setEditingContent(null)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() =>
                                        setEditingContent(activeSubsection.content || '')
                                    }
                                    className="min-h-[100px] p-4 rounded-lg border border-dashed border-slate-300 cursor-pointer hover:bg-slate-50 transition-colors"
                                >
                                    {activeSubsection.content ? (
                                        <p className="text-slate-700 whitespace-pre-wrap">
                                            {activeSubsection.content}
                                        </p>
                                    ) : (
                                        <p className="text-slate-400 italic">
                                            Click to add your story...
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Entries */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                                    Entries
                                </h3>
                                <Button size="sm" variant="outline" onClick={handleAddEntry}>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Entry
                                </Button>
                            </div>

                            {activeSubsection.entries.length > 0 ? (
                                <div className="space-y-3">
                                    {activeSubsection.entries.map((entry) => (
                                        <BiographyEntry
                                            key={entry.id}
                                            entry={entry}
                                            spaceId={spaceId}
                                            personId={personId}
                                            subsectionId={activeSubsection.id}
                                            onUpdate={onUpdate}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 italic">
                                    No entries yet. Add one to record specific memories or events.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
