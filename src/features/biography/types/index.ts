import type {
    Biography,
    BiographySection,
    BiographySubsection,
    BiographyEntry,
    BiographySectionType,
    Visibility,
} from '@/types';

export type BiographyWithSections = Biography & {
    sections: (BiographySection & {
        subsections: (BiographySubsection & {
            entries: BiographyEntry[];
        })[];
    })[];
};

export type CreateSubsectionInput = {
    title: string;
    content?: string;
};

export type CreateEntryInput = {
    title?: string;
    content?: string;
    date?: string;
    location?: string;
};

export type UpdateEntryInput = Partial<CreateEntryInput>;

export type SectionWithSubsections = BiographySection & {
    subsections: (BiographySubsection & {
        entries: BiographyEntry[];
    })[];
};
