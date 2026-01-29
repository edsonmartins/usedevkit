export declare class HttpClient {
    private readonly baseUrl;
    private readonly apiKey;
    private readonly timeout;
    constructor(baseUrl: string, apiKey: string, timeout?: number);
    private request;
    get<T>(path: string): Promise<T>;
    post<T>(path: string, body?: unknown): Promise<T>;
    put<T>(path: string, body?: unknown): Promise<T>;
    delete(path: string): Promise<void>;
}
//# sourceMappingURL=HttpClient.d.ts.map