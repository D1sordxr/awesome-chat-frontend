export interface ErrorService {
    parseErrorResponse(response: Response): Promise<{ message: string }>;
    normalizeError(error: unknown): Error;
    handleError(error: unknown, context: string): never;
}
