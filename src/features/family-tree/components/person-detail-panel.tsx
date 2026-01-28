'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
    X,
    Calendar,
    MapPin,
    Edit,
    Trash2,
    Users,
    Save,
    Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { fetchApi } from '@/lib/api';
import { useFamilyTreeStore } from '../hooks/use-family-tree-store';
import type { Person } from '@/types';
import { Gender } from '@/types';
import { getFullName, getAge } from '../utils/tree-helpers';

type PersonDetailPanelProps = {
    person: Person;
    spaceId: string;
    onClose: () => void;
};

export function PersonDetailPanel({ person, spaceId, onClose }: PersonDetailPanelProps) {

    const router = useRouter();
    const { updatePerson, removePerson } = useFamilyTreeStore();

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const [formData, setFormData] = useState({
        firstName: person.firstName,
        lastName: person.lastName || '',
        gender: person.gender || '',
        birthDate: person.birthDate
            ? format(new Date(person.birthDate), 'yyyy-MM-dd')
            : '',
        deathDate: person.deathDate
            ? format(new Date(person.deathDate), 'yyyy-MM-dd')
            : '',
        birthPlace: person.birthPlace || '',
        bio: person.bio || '',
    });

    const fullName = getFullName(person);
    const age = getAge(person);
    const isDeceased = !!person.deathDate;

    const getInitials = () => {
        const first = person.firstName?.[0] || '';
        const last = person.lastName?.[0] || '';
        return (first + last).toUpperCase() || '?';
    };

    // Handle save
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatedPerson = await fetchApi<Person>(
                `/api/family-spaces/${spaceId}/persons/${person.id}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        firstName: formData.firstName,
                        lastName: formData.lastName || null,
                        gender: formData.gender || null,
                        birthDate: formData.birthDate || null,
                        deathDate: formData.deathDate || null,
                        birthPlace: formData.birthPlace || null,
                        bio: formData.bio || null,
                    }),
                }
            );

            updatePerson(person.id, updatedPerson);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save person:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await fetchApi(`/api/family-spaces/${spaceId}/persons/${person.id}`, {
                method: 'DELETE',
            });

            removePerson(person.id);
            onClose();
        } catch (error) {
            console.error('Failed to delete person:', error);
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setFormData({
            firstName: person.firstName,
            lastName: person.lastName || '',
            gender: person.gender || '',
            birthDate: person.birthDate
                ? format(new Date(person.birthDate), 'yyyy-MM-dd')
                : '',
            deathDate: person.deathDate
                ? format(new Date(person.deathDate), 'yyyy-MM-dd')
                : '',
            birthPlace: person.birthPlace || '',
            bio: person.bio || '',
        });
        setIsEditing(false);
    };

    return (
        <>
            <div className="w-80 border-l bg-white shadow-lg flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="font-semibold text-lg">
                        {isEditing ? 'Edit Person' : 'Details'}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    {isEditing ? (
                        // Edit Form
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name *</Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                                    }
                                    placeholder="First name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                                    }
                                    placeholder="Last name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Select
                                    value={formData.gender}
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({ ...prev, gender: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={Gender.MALE}>Male</SelectItem>
                                        <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                                        <SelectItem value={Gender.OTHER}>Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="birthDate">Birth Date</Label>
                                <Input
                                    id="birthDate"
                                    type="date"
                                    value={formData.birthDate}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, birthDate: e.target.value }))
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="deathDate">Death Date</Label>
                                <Input
                                    id="deathDate"
                                    type="date"
                                    value={formData.deathDate}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, deathDate: e.target.value }))
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="birthPlace">Birth Place</Label>
                                <Input
                                    id="birthPlace"
                                    value={formData.birthPlace}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, birthPlace: e.target.value }))
                                    }
                                    placeholder="City, Country"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Short Bio</Label>
                                <Textarea
                                    id="bio"
                                    value={formData.bio}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, bio: e.target.value }))
                                    }
                                    placeholder="A brief description..."
                                    rows={3}
                                />
                            </div>
                        </div>
                    ) : (
                        // View Mode
                        <>
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
                                            <p className="text-xs text-slate-500 uppercase tracking-wide">
                                                Born
                                            </p>
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
                                            <p className="text-xs text-slate-500 uppercase tracking-wide">
                                                Passed
                                            </p>
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
                                            <p className="text-xs text-slate-500 uppercase tracking-wide">
                                                Birthplace
                                            </p>
                                            <p className="text-sm">{person.birthPlace}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Bio */}
                                {person.bio && (
                                    <div className="pt-4 border-t">
                                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                                            Bio
                                        </p>
                                        <p className="text-sm text-slate-700">{person.bio}</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Actions */}
                <div className="p-4 border-t space-y-2">
                    {isEditing ? (
                        // Edit Mode Actions
                        <>
                            <Button
                                className="w-full"
                                onClick={handleSave}
                                disabled={!formData.firstName || isSaving}
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Save Changes
                            </Button>
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        // View Mode Actions
                        <>
                            <Button
                                className="w-full"
                                variant="default"
                                onClick={() =>
                                    router.push(`/biography/${person.id}?spaceId=${spaceId}`)
                                }
                            >
                                <Users className="h-4 w-4 mr-2" />
                                View Biography
                            </Button>

                            <div className="flex gap-2">
                                <Button
                                    className="flex-1"
                                    variant="outline"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => setShowDeleteDialog(true)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {fullName}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this person and all their relationships
                            from the family tree. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isDeleting ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
