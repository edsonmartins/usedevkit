export declare class DevKitError extends Error {
    readonly cause?: Error | undefined;
    constructor(message: string, cause?: Error | undefined);
}
export declare class AuthenticationError extends DevKitError {
    constructor(message: string, cause?: Error);
}
//# sourceMappingURL=errors.d.ts.map