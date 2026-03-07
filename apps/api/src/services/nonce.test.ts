import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../db/client.js', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    delete: vi.fn(),
  },
}));

import { db } from '../db/client.js';
import { issueNonce, revokeNonce, verifyNonce } from './nonce.js';

const USER_ID = '00000000-0000-0000-0000-000000000001';

describe('issueNonce', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns a UUID string', async () => {
    const insertMock = {
      values: vi.fn().mockReturnThis(),
      onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(db.insert).mockReturnValue(insertMock as never);

    const nonce = await issueNonce(USER_ID);
    expect(typeof nonce).toBe('string');
    expect(nonce).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it('calls db.insert with userId and a nonce', async () => {
    const insertMock = {
      values: vi.fn().mockReturnThis(),
      onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(db.insert).mockReturnValue(insertMock as never);

    await issueNonce(USER_ID);
    expect(insertMock.values).toHaveBeenCalledWith(expect.objectContaining({ userId: USER_ID }));
  });
});

describe('verifyNonce', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns false when no row exists', async () => {
    const selectMock = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    };
    vi.mocked(db.select).mockReturnValue(selectMock as never);

    expect(await verifyNonce(USER_ID, 'any-nonce')).toBe(false);
  });

  it('returns false when nonce does not match', async () => {
    const selectMock = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi
        .fn()
        .mockResolvedValue([{ nonce: 'real-nonce', expiresAt: new Date(Date.now() + 1_000_000) }]),
    };
    vi.mocked(db.select).mockReturnValue(selectMock as never);

    expect(await verifyNonce(USER_ID, 'wrong-nonce')).toBe(false);
  });

  it('returns false when nonce is expired', async () => {
    const selectMock = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi
        .fn()
        .mockResolvedValue([{ nonce: 'valid-nonce', expiresAt: new Date(Date.now() - 1_000) }]),
    };
    vi.mocked(db.select).mockReturnValue(selectMock as never);

    expect(await verifyNonce(USER_ID, 'valid-nonce')).toBe(false);
  });

  it('returns true when nonce matches and is not expired', async () => {
    const selectMock = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi
        .fn()
        .mockResolvedValue([{ nonce: 'valid-nonce', expiresAt: new Date(Date.now() + 1_000_000) }]),
    };
    vi.mocked(db.select).mockReturnValue(selectMock as never);

    expect(await verifyNonce(USER_ID, 'valid-nonce')).toBe(true);
  });
});

describe('revokeNonce', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls db.delete', async () => {
    const deleteMock = {
      where: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(db.delete).mockReturnValue(deleteMock as never);

    await revokeNonce(USER_ID);
    expect(db.delete).toHaveBeenCalledTimes(1);
    expect(deleteMock.where).toHaveBeenCalledTimes(1);
  });
});
