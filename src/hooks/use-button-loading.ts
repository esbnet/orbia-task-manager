import { useState } from 'react';

export function useButtonLoading() {
    const [isLoading, setIsLoading] = useState(false);

    const executeAsync = async <T>(
        asyncFunction: () => Promise<T>,
        onSuccess?: (result: T) => void,
        onError?: (error: any) => void
    ): Promise<T | undefined> => {
        setIsLoading(true);
        try {
            const result = await asyncFunction();
            if (onSuccess) {
                onSuccess(result);
            }
            return result;
        } catch (error) {
            if (onError) {
                onError(error);
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        executeAsync,
    };
}