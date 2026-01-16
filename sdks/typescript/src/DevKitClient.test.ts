import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DevKitClient } from './DevKitClient';
import { AuthenticationError, DevKitError } from './models/errors';

describe('DevKitClient', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('requires apiKey in constructor', () => {
    expect(() => new DevKitClient({ apiKey: '' })).toThrow('API key is required');
  });

  it('fetches feature flag evaluation', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ enabled: true, variantKey: null, reason: 'default' }),
    } as unknown as Response;

    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const client = new DevKitClient({ apiKey: 'test-key', baseUrl: 'http://localhost:8080' });
    const result = await client.evaluateFeatureFlag('flag', 'user');

    expect(result.enabled).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/feature-flags/evaluate',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-key',
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('returns cached config value', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        id: '1',
        key: 'app.name',
        value: 'DevKit',
        type: 'STRING',
        description: null,
        environmentId: 'env',
        versionNumber: 1,
        createdAt: 'now',
        updatedAt: 'now',
      }),
    } as unknown as Response;

    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const client = new DevKitClient({ apiKey: 'test-key', cacheExpireAfter: 60000 });
    const first = await client.getConfig('env', 'app.name');
    const second = await client.getConfig('env', 'app.name');

    expect(first).toBe('DevKit');
    expect(second).toBe('DevKit');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('handles authentication errors', async () => {
    const mockResponse = {
      ok: false,
      status: 401,
      json: vi.fn(),
    } as unknown as Response;

    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const client = new DevKitClient({ apiKey: 'test-key' });

    await expect(client.getConfig('env', 'app.name')).rejects.toBeInstanceOf(AuthenticationError);
  });

  it('handles non-ok responses', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      json: vi.fn(),
    } as unknown as Response;

    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const client = new DevKitClient({ apiKey: 'test-key' });

    await expect(client.getConfig('env', 'app.name')).rejects.toBeInstanceOf(DevKitError);
  });
});
