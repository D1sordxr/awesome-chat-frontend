import type { ErrorService } from "../../domain/core/ports/ErrorService";

export const createErrorServiceImpl = (): ErrorService => {
    return {
        async parseErrorResponse(response: Response): Promise<{ message: string }> {
            try {
                const data = await response.json();
                return {
                    message: data.message || data.error || `HTTP ${response.status}: ${response.statusText}`
                };
            } catch {
                return { message: `HTTP ${response.status}: ${response.statusText}` };
            }
        },

        normalizeError(error: unknown): Error {
            if (error instanceof Error) return error;
            if (typeof error === 'string') return new Error(error);
            return new Error('Unknown error occurred');
        },

        handleError(error: unknown, context: string): never {
            const normalizedError = this.normalizeError(error);
            console.error(`[${context}]`, normalizedError);
            throw normalizedError;
        }
    };
};