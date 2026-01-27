export class ApiError extends Error {
    constructor(
        public status: number,
        message: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export async function fetchApi<T>(
    url: string,
    options?: RequestInit
): Promise<T> {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiError(response.status, error.message || 'Something went wrong');
    }

    return response.json();
}
