import { BiographySectionType } from '@/types';

export type SectionConfig = {
    type: BiographySectionType;
    label: string;
    icon: string;
    description: string;
    defaultSubsections: string[];
};

export const BIOGRAPHY_SECTIONS: SectionConfig[] = [
    {
        type: BiographySectionType.FAMILY,
        label: 'Family',
        icon: '👨‍👩‍👧‍👦',
        description: 'Your immediate and extended family',
        defaultSubsections: [
            'Immediate Family',
            'Parents',
            'Siblings',
            'Children',
            'Extended Family',
            'Grandparents',
            'Uncles, Aunts & Cousins',
            'Family Medical History',
        ],
    },
    {
        type: BiographySectionType.FRIENDS,
        label: 'Friends & Acquaintances',
        icon: '👥',
        description: 'Friends from different phases of life',
        defaultSubsections: [
            'School Friends',
            'College Friends',
            'Work Friends',
            'Social Activities Friends',
        ],
    },
    {
        type: BiographySectionType.RELATIONSHIP,
        label: 'Relationship',
        icon: '💑',
        description: 'Your romantic journey',
        defaultSubsections: [
            'Romance(s)',
            'Courtship',
            'Marriage',
            'Children',
        ],
    },
    {
        type: BiographySectionType.TRADITIONS,
        label: 'Traditions',
        icon: '🎊',
        description: 'Family and cultural traditions',
        defaultSubsections: [
            'Holiday Traditions',
            'Other Traditions / Customs',
        ],
    },
    {
        type: BiographySectionType.ACTIVITIES,
        label: 'Activities',
        icon: '🎯',
        description: 'Hobbies and recreational activities',
        defaultSubsections: [
            'Hobbies / Vocational Activities',
            'Favourite Foods and Recipes',
            'Sports / Recreation Activities',
            'Clubs / Associations / Organizations',
            'Military Service / Volunteer Activities',
        ],
    },
    {
        type: BiographySectionType.PLACES,
        label: 'Experience to Places',
        icon: '🌍',
        description: 'Places you have been and lived',
        defaultSubsections: [
            'Travel / Vacations',
            'Places Lived',
            'Home(s) Lived In',
        ],
    },
    {
        type: BiographySectionType.EDUCATION,
        label: 'Education',
        icon: '🎓',
        description: 'Your educational journey',
        defaultSubsections: [
            'Birth to Start of Kindergarten',
            'Elementary School Years',
            'High School Years',
            'College / University Years',
            'Turning Points',
        ],
    },
    {
        type: BiographySectionType.CAREER,
        label: 'Career / Work',
        icon: '💼',
        description: 'Your professional life',
        defaultSubsections: [
            'First Job Experience',
            'Career Progression',
            'Achievements',
            'Retirement Years',
        ],
    },
    {
        type: BiographySectionType.TIMELINE,
        label: 'Historical Timeline',
        icon: '📅',
        description: 'Important events and milestones',
        defaultSubsections: [
            'Personal Historical Timeline',
            'Special Occasions',
            'Historical Events Witnessed',
            'Spiritual Journey',
        ],
    },
    {
        type: BiographySectionType.AWARDS,
        label: 'Awards',
        icon: '🏆',
        description: 'Recognition and achievements',
        defaultSubsections: [
            'Awards / Honours Received',
        ],
    },
    {
        type: BiographySectionType.PHOTOS,
        label: 'Photo Gallery',
        icon: '📸',
        description: 'Favourite photographs',
        defaultSubsections: [
            'Favourite Photograph(s)',
        ],
    },
    {
        type: BiographySectionType.MISCELLANEOUS,
        label: 'Miscellaneous',
        icon: '📝',
        description: 'Other important topics',
        defaultSubsections: [
            'How I Met...',
            'What\'s Important To Me',
            'Why ... Is Important To Me',
        ],
    },
];

export const getSectionConfig = (type: BiographySectionType): SectionConfig | undefined => {
    return BIOGRAPHY_SECTIONS.find((s) => s.type === type);
};
