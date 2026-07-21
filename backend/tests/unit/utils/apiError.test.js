const ApiError = require('../../../src/utils/ApiError');

describe('ApiError', () => {
  it('is an instance of Error', () => {
    expect(ApiError.notFound()).toBeInstanceOf(Error);
  });

  it.each([
    ['badRequest', 400],
    ['unauthorized', 401],
    ['forbidden', 403],
    ['notFound', 404],
    ['conflict', 409],
    ['internal', 500],
  ])('%s() produces status %d', (factory, statusCode) => {
    const err = ApiError[factory]('custom message');
    expect(err.statusCode).toBe(statusCode);
    expect(err.message).toBe('custom message');
  });

  it('carries field-level errors', () => {
    const err = ApiError.badRequest('Validation failed', [{ field: 'email', message: 'invalid' }]);
    expect(err.errors).toEqual([{ field: 'email', message: 'invalid' }]);
  });

  it('defaults to an empty errors array', () => {
    expect(ApiError.notFound().errors).toEqual([]);
  });
});
