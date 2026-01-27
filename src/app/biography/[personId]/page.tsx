'use client';

import { use } from 'react';
import { BiographyView } from '@/features/biography/components';

type Props = {
    params: Promise<{ personId: string }>;
    searchParams: Promise<{ spaceId?: string }>;
};

export default function BiographyPage({ params, searchParams }: Props) {
    const { personId } = use(params);
    const { spaceId } = use(searchParams);

    if (!spaceId) {
        return (
            <div className="h-screen flex items-center justify-center">
                <p className="text-slate-500">Missing space ID</p>
            </div>
        );
    }

    return <BiographyView personId={personId} spaceId={spaceId} />;
}
