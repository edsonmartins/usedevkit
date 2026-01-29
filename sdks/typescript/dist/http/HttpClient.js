"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
const errors_1 = require("../models/errors");
class HttpClient {
    constructor(baseUrl, apiKey, timeout = 10000) {
        this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        this.apiKey = apiKey;
        this.timeout = timeout;
    }
    async request(path, options) {
        const url = `${this.baseUrl}${path}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
            });
            clearTimeout(timeoutId);
            if (response.status === 401) {
                throw new errors_1.AuthenticationError('Invalid API key');
            }
            if (!response.ok) {
                throw new errors_1.DevKitError(`HTTP error: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            if (error instanceof errors_1.DevKitError) {
                throw error;
            }
            if (error instanceof Error && error.name === 'AbortError') {
                throw new errors_1.DevKitError('Request timeout');
            }
            throw new errors_1.DevKitError('Network error', error);
        }
    }
    async get(path) {
        return this.request(path, { method: 'GET' });
    }
    async post(path, body) {
        return this.request(path, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }
    async put(path, body) {
        return this.request(path, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    }
    async delete(path) {
        await this.request(path, { method: 'DELETE' });
    }
}
exports.HttpClient = HttpClient;
//# sourceMappingURL=HttpClient.js.map