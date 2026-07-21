const { generateRefreshToken, hashToken, parseDurationToMs } = require('../../../src/utils/token');

describe('token utils', () => {
  it('generates an 80-character hex refresh token', () => {
    const token = generateRefreshToken();
    expect(token).toMatch(/^[0-9a-f]{80}$/);
  });

  it('generates distinct tokens on each call', () => {
    expect(generateRefreshToken()).not.toBe(generateRefreshToken());
  });

  it('hashes deterministically', () => {
    expect(hashToken('abc')).toBe(hashToken('abc'));
  });

  it('produces different hashes for different inputs', () => {
    expect(hashToken('abc')).not.toBe(hashToken('abd'));
  });

  it.each([
    ['30s', 30_000],
    ['15m', 900_000],
    ['2h', 7_200_000],
    ['7d', 604_800_000],
  ])('parses %s to %d ms', (input, expected) => {
    expect(parseDurationToMs(input)).toBe(expected);
  });

  it('throws on an invalid duration format', () => {
    expect(() => parseDurationToMs('banana')).toThrow('Invalid duration format');
  });
});
