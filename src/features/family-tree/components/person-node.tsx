'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { User, Plus, Heart, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Gender } from '@/types';
import { getFullName, getAge } from '../utils/tree-helpers';
import type { PersonNodeData, AddRelativeType } from '../types';

function PersonNodeComponent({ data, selected }: NodeProps<PersonNodeData>) {
    const { person, onSelect, onAddRelative } = data;
    const fullName = getFullName(person);
    const age = getAge(person);
    const isDeceased = !!person.deathDate;

    const getInitials = () => {
        const first = person.firstName?.[0] || '';
        const last = person.lastName?.[0] || '';
        return (first + last).toUpperCase() || '?';
    };

    const getGenderColor = () => {
        switch (person.gender) {
            case Gender.MALE:
                return 'border-blue-400 bg-blue-50';
            case Gender.FEMALE:
                return 'border-pink-400 bg-pink-50';
            default:
                return 'border-slate-300 bg-slate-50';
        }
    };

    const handleContextAction = (action: AddRelativeType) => {
        onAddRelative(person.id, action);
    };

    return (
        <ContextMenu.Root>
            <ContextMenu.Trigger asChild>
                <div
                    onClick={() => onSelect(person.id)}
                    className={cn(
                        'cursor-pointer rounded-lg border-2 p-3 shadow-md transition-all hover:shadow-lg',
                        'min-w-[140px] max-w-[180px]',
                        getGenderColor(),
                        selected && 'ring-2 ring-primary ring-offset-2',
                        isDeceased && 'opacity-75'
                    )}
                >
                    {/* Handles for connections */}
                    <Handle
                        type="target"
                        position={Position.Top}
                        className="!bg-slate-400 !w-2 !h-2"
                    />
                    <Handle
                        type="source"
                        position={Position.Bottom}
                        className="!bg-slate-400 !w-2 !h-2"
                    />
                    <Handle
                        type="source"
                        position={Position.Left}
                        id="spouse-left"
                        className="!bg-pink-400 !w-2 !h-2"
                    />
                    <Handle
                        type="target"
                        position={Position.Right}
                        id="spouse-right"
                        className="!bg-pink-400 !w-2 !h-2"
                    />

                    {/* Avatar */}
                    <div className="flex justify-center mb-2">
                        <Avatar className="h-12 w-12 border-2 border-white shadow">
                            {person.profilePhotoUrl ? (
                                <AvatarImage src={person.profilePhotoUrl} alt={fullName} />
                            ) : null}
                            <AvatarFallback className="bg-white text-slate-600 text-sm font-medium">
                                {getInitials()}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Name */}
                    <p className="text-center font-medium text-sm text-slate-800 truncate">
                        {fullName || 'Unknown'}
                    </p>

                    {/* Age / Years */}
                    {age !== null && (
                        <p className="text-center text-xs text-slate-500 mt-0.5">
                            {isDeceased ? `${age} years` : `Age ${age}`}
                        </p>
                    )}

                    {/* Status badges */}
                    <div className="flex justify-center gap-1 mt-2">
                        {isDeceased && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                Deceased
                            </Badge>
                        )}
                        {person.status === 'CLAIMED' && (
                            <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-green-500">
                                Claimed
                            </Badge>
                        )}
                    </div>
                </div>
            </ContextMenu.Trigger>

            {/* Right-click context menu */}
            <ContextMenu.Portal>
                <ContextMenu.Content
                    className="min-w-[180px] rounded-md border bg-white p-1 shadow-lg"
                >
                    <ContextMenu.Label className="px-2 py-1.5 text-xs font-semibold text-slate-500">
                        Add Relative
                    </ContextMenu.Label>

                    <ContextMenu.Item
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-100 outline-none"
                        onClick={() => handleContextAction('father')}
                    >
                        <User className="h-4 w-4 text-blue-500" />
                        Add Father
                    </ContextMenu.Item>

                    <ContextMenu.Item
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-100 outline-none"
                        onClick={() => handleContextAction('mother')}
                    >
                        <User className="h-4 w-4 text-pink-500" />
                        Add Mother
                    </ContextMenu.Item>

                    <ContextMenu.Separator className="my-1 h-px bg-slate-200" />

                    <ContextMenu.Item
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-100 outline-none"
                        onClick={() => handleContextAction('spouse')}
                    >
                        <Heart className="h-4 w-4 text-red-500" />
                        Add Spouse
                    </ContextMenu.Item>

                    <ContextMenu.Separator className="my-1 h-px bg-slate-200" />

                    <ContextMenu.Item
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-100 outline-none"
                        onClick={() => handleContextAction('son')}
                    >
                        <User className="h-4 w-4 text-blue-500" />
                        Add Son
                    </ContextMenu.Item>

                    <ContextMenu.Item
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-100 outline-none"
                        onClick={() => handleContextAction('daughter')}
                    >
                        <User className="h-4 w-4 text-pink-500" />
                        Add Daughter
                    </ContextMenu.Item>

                    <ContextMenu.Separator className="my-1 h-px bg-slate-200" />

                    <ContextMenu.Item
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-100 outline-none"
                        onClick={() => handleContextAction('brother')}
                    >
                        <Users className="h-4 w-4 text-blue-500" />
                        Add Brother
                    </ContextMenu.Item>

                    <ContextMenu.Item
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-100 outline-none"
                        onClick={() => handleContextAction('sister')}
                    >
                        <Users className="h-4 w-4 text-pink-500" />
                        Add Sister
                    </ContextMenu.Item>
                </ContextMenu.Content>
            </ContextMenu.Portal>
        </ContextMenu.Root>
    );
}

export const PersonNode = memo(PersonNodeComponent);
