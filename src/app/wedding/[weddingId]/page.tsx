'use client';

import { use } from 'react';
import { WeddingView } from '@/features/wedding/components/wedding-view';

type Props = {
    params: Promise<{ weddingId: string }>;
    searchParams: Promise<{ spaceId?: string }>;
};

export default function WeddingPage({ params, searchParams }: Props) {
    const { weddingId } = use(params);
    const { spaceId } = use(searchParams);

    if (!spaceId) {
        return (
            <div className="h-screen flex items-center justify-center">
                <p className="text-slate-500">Missing space ID</p>
            </div>
        );
    }

    return <WeddingView weddingId={weddingId} spaceId={spaceId} />;
}
