import { describe, expect, it } from 'vitest';
import { formatModifier, modifier, POINT_BUY_BUDGET, pointBuyCost } from './wizardState.js';

describe('modifier', () => {
  it('returns -5 for score 1', () => expect(modifier(1)).toBe(-5));
  it('returns -1 for score 9', () => expect(modifier(9)).toBe(-1));
  it('returns 0 for score 10', () => expect(modifier(10)).toBe(0));
  it('returns 0 for score 11', () => expect(modifier(11)).toBe(0));
  it('returns +1 for score 12', () => expect(modifier(12)).toBe(1));
  it('returns +3 for score 16', () => expect(modifier(16)).toBe(3));
  it('returns +5 for score 20', () => expect(modifier(20)).toBe(5));
});

describe('formatModifier', () => {
  it('prefixes positive modifiers with +', () => expect(formatModifier(12)).toBe('+1'));
  it('prefixes zero modifier with +', () => expect(formatModifier(10)).toBe('+0'));
  it('leaves negative modifiers without prefix', () => expect(formatModifier(8)).toBe('-1'));
});

describe('pointBuyCost', () => {
  it('returns 0 when all scores are 8', () => {
    expect(pointBuyCost({ str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 })).toBe(0);
  });

  it('returns full budget for maximised scores (15 costs 9 each)', () => {
    const cost = pointBuyCost({
      str: 15,
      dex: 15,
      con: 8,
      int: 8,
      wis: 8,
      cha: 8,
    });
    // 9 + 9 = 18 — more than 27 but that's an overspent check on the UI
    expect(cost).toBe(18);
  });

  it('returns exactly 27 for a legal maxed standard set', () => {
    // 15(9) + 14(7) + 13(5) + 12(4) + 10(2) + 8(0) = 27
    const cost = pointBuyCost({
      str: 15,
      dex: 14,
      con: 13,
      int: 12,
      wis: 10,
      cha: 8,
    });
    expect(cost).toBe(POINT_BUY_BUDGET);
  });
});
