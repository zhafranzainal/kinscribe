import type { Person, Relationship } from '@/types';
import { RelationshipType } from '@/types';

/**
 * Get parents of a person
 */
export function getParents(
    personId: string,
    relationships: Relationship[],
    persons: Person[]
): Person[] {
    const parentRelations = relationships.filter(
        (r) => r.type === RelationshipType.PARENT_CHILD && r.person2Id === personId
    );

    return parentRelations
        .map((r) => persons.find((p) => p.id === r.person1Id))
        .filter((p): p is Person => p !== undefined);
}

/**
 * Get children of a person
 */
export function getChildren(
    personId: string,
    relationships: Relationship[],
    persons: Person[]
): Person[] {
    const childRelations = relationships.filter(
        (r) => r.type === RelationshipType.PARENT_CHILD && r.person1Id === personId
    );

    return childRelations
        .map((r) => persons.find((p) => p.id === r.person2Id))
        .filter((p): p is Person => p !== undefined);
}

/**
 * Get spouses of a person
 */
export function getSpouses(
    personId: string,
    relationships: Relationship[],
    persons: Person[]
): Person[] {
    const spouseRelations = relationships.filter(
        (r) =>
            r.type === RelationshipType.SPOUSE &&
            (r.person1Id === personId || r.person2Id === personId)
    );

    return spouseRelations
        .map((r) => {
            const spouseId = r.person1Id === personId ? r.person2Id : r.person1Id;
            return persons.find((p) => p.id === spouseId);
        })
        .filter((p): p is Person => p !== undefined);
}

/**
 * Get siblings of a person
 */
export function getSiblings(
    personId: string,
    relationships: Relationship[],
    persons: Person[]
): Person[] {
    const parents = getParents(personId, relationships, persons);

    if (parents.length === 0) return [];

    const siblings = new Set<string>();

    parents.forEach((parent) => {
        const children = getChildren(parent.id, relationships, persons);
        children.forEach((child) => {
            if (child.id !== personId) {
                siblings.add(child.id);
            }
        });
    });

    return Array.from(siblings)
        .map((id) => persons.find((p) => p.id === id))
        .filter((p): p is Person => p !== undefined);
}

/**
 * Get full name of a person
 */
export function getFullName(person: Person): string {
    return [person.firstName, person.lastName].filter(Boolean).join(' ');
}

/**
 * Calculate age or years lived
 */
export function getAge(person: Person): number | null {
    if (!person.birthDate) return null;

    const endDate = person.deathDate ? new Date(person.deathDate) : new Date();
    const birthDate = new Date(person.birthDate);

    let age = endDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = endDate.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}
