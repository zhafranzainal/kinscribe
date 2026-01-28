'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
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
import { fetchApi } from '@/lib/api';
import { getFullName } from '@/features/family-tree/utils/tree-helpers';
import type { Person } from '@/types';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    persons: Person[];
    spaceId: string;
    onSuccess: () => void;
};

export function CreateWeddingDialog({
    open,
    onOpenChange,
    persons,
    spaceId,
    onSuccess,
}: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        venue: '',
        person1Id: '',
        person2Id: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.person1Id || !formData.person2Id) return;

        setIsLoading(true);
        try {
            await fetchApi(`/api/family-spaces/${spaceId}/weddings`, {
                method: 'POST',
                body: JSON.stringify({
                    name: formData.name || `${getCoupleName()} Wedding`,
                    date: formData.date || undefined,
                    venue: formData.venue || undefined,
                    person1Id: formData.person1Id,
                    person2Id: formData.person2Id,
                }),
            });

            onSuccess();
            onOpenChange(false);
            resetForm();
        } catch (error) {
            console.error('Failed to create wedding:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getCoupleName = () => {
        const p1 = persons.find((p) => p.id === formData.person1Id);
        const p2 = persons.find((p) => p.id === formData.person2Id);
        if (p1 && p2) {
            return `${p1.firstName} & ${p2.firstName}'s`;
        }
        return 'Our';
    };

    const resetForm = () => {
        setFormData({
            name: '',
            date: '',
            venue: '',
            person1Id: '',
            person2Id: '',
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Wedding Event</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        {/* Couple Selection */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Person 1 *</Label>
                                <Select
                                    value={formData.person1Id}
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({ ...prev, person1Id: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select person" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {persons
                                            .filter((p) => p.id !== formData.person2Id)
                                            .map((person) => (
                                                <SelectItem key={person.id} value={person.id}>
                                                    {getFullName(person)}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Person 2 *</Label>
                                <Select
                                    value={formData.person2Id}
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({ ...prev, person2Id: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select person" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {persons
                                            .filter((p) => p.id !== formData.person1Id)
                                            .map((person) => (
                                                <SelectItem key={person.id} value={person.id}>
                                                    {getFullName(person)}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Wedding Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Wedding Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                                }
                                placeholder={`${getCoupleName()} Wedding`}
                            />
                        </div>

                        {/* Date */}
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                                }
                            />
                        </div>

                        {/* Venue */}
                        <div className="space-y-2">
                            <Label htmlFor="venue">Venue</Label>
                            <Input
                                id="venue"
                                value={formData.venue}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, venue: e.target.value }))
                                }
                                placeholder="Wedding venue"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!formData.person1Id || !formData.person2Id || isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : null}
                            Create Wedding
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
