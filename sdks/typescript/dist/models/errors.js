"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationError = exports.DevKitError = void 0;
class DevKitError extends Error {
    constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = 'DevKitError';
    }
}
exports.DevKitError = DevKitError;
class AuthenticationError extends DevKitError {
    constructor(message, cause) {
        super(message, cause);
        this.name = 'AuthenticationError';
    }
}
exports.AuthenticationError = AuthenticationError;
//# sourceMappingURL=errors.js.map