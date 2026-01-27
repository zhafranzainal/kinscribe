'use client';

import { X, Calendar, MapPin, Edit, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Person } from '@/types';
import { getFullName, getAge } from '../utils/tree-helpers';
import { format } from 'date-fns';

type PersonDetailPanelProps = {
    person: Person;
    onClose: () => void;
};

export function PersonDetailPanel({ person, onClose }: PersonDetailPanelProps) {
    const fullName = getFullName(person);
    const age = getAge(person);
    const isDeceased = !!person.deathDate;

    const getInitials = () => {
        const first = person.firstName?.[0] || '';
        const last = person.lastName?.[0] || '';
        return (first + last).toUpperCase() || '?';
    };

    return (
        <div className="w-80 border-l bg-white shadow-lg flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-semibold text-lg">Details</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
                {/* Avatar & Name */}
                <div className="flex flex-col items-center text-center mb-6">
                    <Avatar className="h-20 w-20 mb-3">
                        {person.profilePhotoUrl ? (
                            <AvatarImage src={person.profilePhotoUrl} alt={fullName} />
                        ) : null}
                        <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
                    </Avatar>

                    <h3 className="font-semibold text-xl">{fullName}</h3>

                    {age !== null && (
                        <p className="text-slate-500 text-sm">
                            {isDeceased ? `Lived ${age} years` : `${age} years old`}
                        </p>
                    )}

                    <div className="flex gap-2 mt-2">
                        {isDeceased && <Badge variant="secondary">Deceased</Badge>}
                        {person.status === 'CLAIMED' && (
                            <Badge className="bg-green-500">Claimed</Badge>
                        )}
                        {person.status === 'INVITED' && (
                            <Badge variant="outline">Invited</Badge>
                        )}
                    </div>
                </div>

                {/* Info sections */}
                <div className="space-y-4">
                    {/* Birth */}
                    {person.birthDate && (
                        <div className="flex items-start gap-3">
                            <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Born</p>
                                <p className="text-sm">
                                    {format(new Date(person.birthDate), 'MMMM d, yyyy')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Death */}
                    {person.deathDate && (
                        <div className="flex items-start gap-3">
                            <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Passed</p>
                                <p className="text-sm">
                                    {format(new Date(person.deathDate), 'MMMM d, yyyy')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Birthplace */}
                    {person.birthPlace && (
                        <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Birthplace</p>
                                <p className="text-sm">{person.birthPlace}</p>
                            </div>
                        </div>
                    )}

                    {/* Bio */}
                    {person.bio && (
                        <div className="pt-4 border-t">
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Bio</p>
                            <p className="text-sm text-slate-700">{person.bio}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t space-y-2">
                <Button className="w-full" variant="default">
                    <Users className="h-4 w-4 mr-2" />
                    View Biography
                </Button>

                <div className="flex gap-2">
                    <Button className="flex-1" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                    <Button variant="outline" className="text-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
