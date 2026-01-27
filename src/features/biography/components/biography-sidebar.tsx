'use client';

import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { getSectionConfig } from '../constants/sections';
import type { SectionWithSubsections } from '../types';

type Props = {
    sections: SectionWithSubsections[];
    activeSectionId: string | null;
    activeSubsectionId: string | null;
    onSectionClick: (sectionId: string) => void;
    onSubsectionClick: (subsectionId: string) => void;
};

export function BiographySidebar({
    sections,
    activeSectionId,
    activeSubsectionId,
    onSectionClick,
    onSubsectionClick,
}: Props) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set([activeSectionId || ''])
    );

    const toggleSection = (sectionId: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId);
        } else {
            newExpanded.add(sectionId);
        }
        setExpandedSections(newExpanded);
    };

    return (
        <aside className="w-72 border-r bg-slate-50 overflow-y-auto">
            <nav className="p-4">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                    Sections
                </h2>

                <ul className="space-y-1">
                    {sections.map((section) => {
                        const config = getSectionConfig(section.sectionType);
                        const isExpanded = expandedSections.has(section.id);
                        const isActive = section.id === activeSectionId;

                        return (
                            <li key={section.id}>
                                {/* Section header */}
                                <button
                                    onClick={() => {
                                        toggleSection(section.id);
                                        onSectionClick(section.id);
                                    }}
                                    className={cn(
                                        'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors',
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-slate-200 text-slate-700'
                                    )}
                                >
                                    {isExpanded ? (
                                        <ChevronDown className="h-4 w-4 shrink-0" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 shrink-0" />
                                    )}
                                    <span className="text-lg">{config?.icon}</span>
                                    <span className="text-sm font-medium truncate">
                                        {config?.label || section.sectionType}
                                    </span>
                                </button>

                                {/* Subsections */}
                                {isExpanded && section.subsections.length > 0 && (
                                    <ul className="ml-6 mt-1 space-y-1">
                                        {section.subsections.map((subsection) => {
                                            const isSubActive = subsection.id === activeSubsectionId;

                                            return (
                                                <li key={subsection.id}>
                                                    <button
                                                        onClick={() => onSubsectionClick(subsection.id)}
                                                        className={cn(
                                                            'w-full text-left px-3 py-1.5 rounded text-sm transition-colors',
                                                            isSubActive
                                                                ? 'bg-primary/10 text-primary font-medium'
                                                                : 'text-slate-600 hover:bg-slate-200'
                                                        )}
                                                    >
                                                        {subsection.title}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
}
