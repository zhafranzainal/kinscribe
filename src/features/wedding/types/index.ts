import type {
    WeddingEvent,
    GuestList,
    GuestListEntry,
    Person,
    RsvpStatus,
} from '@/types';

export type WeddingEventWithDetails = WeddingEvent & {
    person1: Person;
    person2: Person;
    guestLists: GuestListWithEntries[];
};

export type GuestListWithEntries = GuestList & {
    entries: GuestListEntryWithPerson[];
};

export type GuestListEntryWithPerson = GuestListEntry & {
    person: Person | null;
};

export type CreateWeddingInput = {
    name: string;
    date?: string;
    venue?: string;
    person1Id: string;
    person2Id: string;
};

export type CreateGuestListInput = {
    name: string;
};

export type AddGuestInput = {
    personId?: string;
    manualName?: string;
    manualEmail?: string;
    manualPhone?: string;
};

export type UpdateGuestInput = {
    rsvpStatus?: RsvpStatus;
    plusOne?: boolean;
    plusOneName?: string;
    dietaryRestrictions?: string;
    tableAssignment?: string;
    notes?: string;
};

export type GuestStats = {
    total: number;
    confirmed: number;
    declined: number;
    pending: number;
    maybe: number;
    plusOnes: number;
};
