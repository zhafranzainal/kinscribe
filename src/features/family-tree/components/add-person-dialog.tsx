'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Gender } from '@/types';
import type { AddRelativeType } from '../types';

type AddPersonDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    relationType: AddRelativeType | null;
    relativeToName: string;
    onSubmit: (data: AddPersonFormData) => void;
};

export type AddPersonFormData = {
    firstName: string;
    lastName: string;
    gender: Gender | null;
    birthDate: string;
};

const relationLabels: Record<AddRelativeType, string> = {
    father: 'Father',
    mother: 'Mother',
    spouse: 'Spouse',
    son: 'Son',
    daughter: 'Daughter',
    brother: 'Brother',
    sister: 'Sister',
};

export function AddPersonDialog({
    open,
    onOpenChange,
    relationType,
    relativeToName,
    onSubmit,
}: AddPersonDialogProps) {
    const [formData, setFormData] = useState<AddPersonFormData>({
        firstName: '',
        lastName: '',
        gender: null,
        birthDate: '',
    });

    // Auto-set gender based on relation type
    const getDefaultGender = (): Gender | null => {
        switch (relationType) {
            case 'father':
            case 'son':
            case 'brother':
                return Gender.MALE;
            case 'mother':
            case 'daughter':
            case 'sister':
                return Gender.FEMALE;
            default:
                return null;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        onSubmit({
            ...formData,
            gender: formData.gender || getDefaultGender(),
        });

        // Reset form
        setFormData({
            firstName: '',
            lastName: '',
            gender: null,
            birthDate: '',
        });
    };

    const title = relationType
        ? `Add ${relationLabels[relationType]} of ${relativeToName}`
        : 'Add Person';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name *</Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                                    }
                                    placeholder="John"
                                    required
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
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender</Label>
                            <Select
                                value={formData.gender || getDefaultGender() || ''}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({ ...prev, gender: value as Gender }))
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
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Add Person</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
