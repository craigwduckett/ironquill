import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../db/client.js', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { db } from '../db/client.js';
import { assertOwner, getById, remove, update } from './characters.js';

const OWNER_ID = '00000000-0000-0000-0000-000000000001';
const OTHER_ID = '00000000-0000-0000-0000-000000000002';
const CHAR_ID = 'aaaaaaaa-0000-0000-0000-000000000001';

function makeSelectChain(result: unknown[]) {
  const chain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(result),
    orderBy: vi.fn().mockResolvedValue(result),
  };
  vi.mocked(db.select).mockReturnValue(chain as never);
  return chain;
}

function makeUpdateChain(result: unknown[]) {
  const chain = {
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue(result),
  };
  vi.mocked(db.update).mockReturnValue(chain as never);
  return chain;
}

function makeDeleteChain() {
  const chain = { where: vi.fn().mockResolvedValue(undefined) };
  vi.mocked(db.delete).mockReturnValue(chain as never);
  return chain;
}

describe('getById', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the character when the requesting user is the owner', async () => {
    const character = { id: CHAR_ID, userId: OWNER_ID, name: 'Gandalf' };
    makeSelectChain([character]);
    expect(await getById(CHAR_ID, OWNER_ID)).toEqual(character);
  });

  it('throws 404 when the character does not exist', async () => {
    makeSelectChain([]);
    await expect(getById(CHAR_ID, OWNER_ID)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('throws 403 when the requesting user does not own the character', async () => {
    const character = { id: CHAR_ID, userId: OWNER_ID, name: 'Gandalf' };
    makeSelectChain([character]);
    await expect(getById(CHAR_ID, OTHER_ID)).rejects.toMatchObject({
      statusCode: 403,
    });
  });
});

describe('assertOwner', () => {
  beforeEach(() => vi.clearAllMocks());

  it('resolves without throwing when the user owns the character', async () => {
    makeSelectChain([{ id: CHAR_ID }]);
    await expect(assertOwner(CHAR_ID, OWNER_ID)).resolves.toBeUndefined();
  });

  it('throws 403 when the user does not own the character', async () => {
    makeSelectChain([]);
    await expect(assertOwner(CHAR_ID, OTHER_ID)).rejects.toMatchObject({
      statusCode: 403,
    });
  });
});

describe('update', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws 404 when no character matches owner + id', async () => {
    makeSelectChain([]);
    await expect(update(CHAR_ID, OWNER_ID, { name: 'Saruman' })).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('returns the updated character on success', async () => {
    const existing = { id: CHAR_ID };
    const updated = { id: CHAR_ID, userId: OWNER_ID, name: 'Saruman' };
    makeSelectChain([existing]);
    makeUpdateChain([updated]);
    expect(await update(CHAR_ID, OWNER_ID, { name: 'Saruman' })).toEqual(updated);
  });
});

describe('remove', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws 404 when the character does not belong to the user', async () => {
    makeSelectChain([]);
    await expect(remove(CHAR_ID, OWNER_ID)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('calls db.delete when the character belongs to the user', async () => {
    makeSelectChain([{ id: CHAR_ID }]);
    const chain = makeDeleteChain();
    await remove(CHAR_ID, OWNER_ID);
    expect(chain.where).toHaveBeenCalledTimes(1);
  });
});
