interface ApiConfig {
    baseUrl: string;
    errorService: ErrorService;
    getAuthToken?: () => string | null;
}

export type {ApiConfig}