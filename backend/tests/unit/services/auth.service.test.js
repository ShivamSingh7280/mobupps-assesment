jest.mock('../../../src/config/supabaseClient', () => ({ from: jest.fn() }));

const bcrypt = require('bcrypt');
const supabase = require('../../../src/config/supabaseClient');
const { createQueryBuilder } = require('../../helpers/mockSupabase');
const authService = require('../../../src/services/auth.service');

describe('auth.service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('creates a new user and returns tokens', async () => {
      supabase.from
        .mockReturnValueOnce(createQueryBuilder({ data: null, error: null })) // existing-email lookup
        .mockReturnValueOnce(
          createQueryBuilder({
            data: { id: 'u1', name: 'Test', email: 't@example.com', created_at: 'now' },
            error: null,
          })
        ) // insert user
        .mockReturnValueOnce(createQueryBuilder({ error: null })); // insert refresh_tokens

      const result = await authService.register({ name: 'Test', email: 't@example.com', password: 'password123' });

      expect(result.user.email).toBe('t@example.com');
      expect(result.accessToken).toEqual(expect.any(String));
      expect(result.refreshToken).toEqual(expect.any(String));
    });

    it('rejects a duplicate email with 409', async () => {
      supabase.from.mockReturnValueOnce(createQueryBuilder({ data: { id: 'existing' }, error: null }));

      await expect(
        authService.register({ name: 'Test', email: 'dup@example.com', password: 'password123' })
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('surfaces a DB lookup failure as a 500, not a false negative', async () => {
      supabase.from.mockReturnValueOnce(
        createQueryBuilder({ data: null, error: { message: 'connection refused' } })
      );

      await expect(
        authService.register({ name: 'Test', email: 't2@example.com', password: 'password123' })
      ).rejects.toMatchObject({ statusCode: 500 });
    });
  });

  describe('login', () => {
    it('logs in with correct credentials and strips the password hash from the response', async () => {
      const passwordHash = await bcrypt.hash('password123', 4);
      supabase.from
        .mockReturnValueOnce(
          createQueryBuilder({
            data: { id: 'u1', name: 'Test', email: 't@example.com', created_at: 'now', password_hash: passwordHash },
            error: null,
          })
        )
        .mockReturnValueOnce(createQueryBuilder({ error: null }));

      const result = await authService.login({ email: 't@example.com', password: 'password123' });

      expect(result.user.email).toBe('t@example.com');
      expect(result.user.password_hash).toBeUndefined();
    });

    it('rejects a wrong password with a generic 401 message', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 4);
      supabase.from.mockReturnValueOnce(
        createQueryBuilder({ data: { id: 'u1', password_hash: passwordHash }, error: null })
      );

      await expect(authService.login({ email: 't@example.com', password: 'wrong-password' })).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid credentials',
      });
    });

    it('rejects an unknown email with the same generic 401 message (no user-enumeration)', async () => {
      supabase.from.mockReturnValueOnce(createQueryBuilder({ data: null, error: null }));

      await expect(
        authService.login({ email: 'nobody@example.com', password: 'whatever1' })
      ).rejects.toMatchObject({ statusCode: 401, message: 'Invalid credentials' });
    });

    it('surfaces a DB lookup failure as 500, not a false "invalid credentials"', async () => {
      supabase.from.mockReturnValueOnce(createQueryBuilder({ data: null, error: { message: 'down' } }));

      await expect(authService.login({ email: 't@example.com', password: 'whatever1' })).rejects.toMatchObject({
        statusCode: 500,
      });
    });
  });

  describe('refreshTokens', () => {
    it('rotates a valid refresh token', async () => {
      const futureDate = new Date(Date.now() + 60_000).toISOString();
      supabase.from
        .mockReturnValueOnce(
          createQueryBuilder({ data: { id: 'rt1', user_id: 'u1', expires_at: futureDate, revoked_at: null }, error: null })
        ) // lookup
        .mockReturnValueOnce(createQueryBuilder({ error: null })) // revoke old
        .mockReturnValueOnce(createQueryBuilder({ error: null })); // insert new refresh token

      const result = await authService.refreshTokens('some-raw-token');

      expect(result.accessToken).toEqual(expect.any(String));
      expect(result.refreshToken).toEqual(expect.any(String));
    });

    it('rejects a missing token', async () => {
      await expect(authService.refreshTokens(undefined)).rejects.toMatchObject({ statusCode: 401 });
    });

    it('rejects an unknown token', async () => {
      supabase.from.mockReturnValueOnce(createQueryBuilder({ data: null, error: null }));
      await expect(authService.refreshTokens('bogus')).rejects.toMatchObject({ statusCode: 401 });
    });

    it('detects reuse of an already-rotated token and revokes every session for that user', async () => {
      supabase.from
        .mockReturnValueOnce(
          createQueryBuilder({
            data: {
              id: 'rt1',
              user_id: 'u1',
              expires_at: new Date(Date.now() + 60_000).toISOString(),
              revoked_at: new Date().toISOString(),
            },
            error: null,
          })
        )
        .mockReturnValueOnce(createQueryBuilder({ error: null })); // revoke-all update

      await expect(authService.refreshTokens('stolen-token')).rejects.toMatchObject({ statusCode: 401 });
      expect(supabase.from).toHaveBeenCalledTimes(2);
    });

    it('rejects an expired token', async () => {
      const pastDate = new Date(Date.now() - 60_000).toISOString();
      supabase.from.mockReturnValueOnce(
        createQueryBuilder({ data: { id: 'rt1', user_id: 'u1', expires_at: pastDate, revoked_at: null }, error: null })
      );

      await expect(authService.refreshTokens('expired-token')).rejects.toMatchObject({ statusCode: 401 });
    });
  });

  describe('logout', () => {
    it('is a no-op when there is no refresh token', async () => {
      await authService.logout(undefined);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('revokes the matching refresh token', async () => {
      const builder = createQueryBuilder({ error: null });
      supabase.from.mockReturnValueOnce(builder);

      await authService.logout('some-token');

      expect(builder.update).toHaveBeenCalledWith(expect.objectContaining({ revoked_at: expect.any(String) }));
    });
  });

  describe('getUserById', () => {
    it('returns the user when found', async () => {
      supabase.from.mockReturnValueOnce(createQueryBuilder({ data: { id: 'u1', email: 't@example.com' }, error: null }));
      const user = await authService.getUserById('u1');
      expect(user.email).toBe('t@example.com');
    });

    it('throws 404 when not found', async () => {
      supabase.from.mockReturnValueOnce(createQueryBuilder({ data: null, error: null }));
      await expect(authService.getUserById('missing')).rejects.toMatchObject({ statusCode: 404 });
    });

    it('throws 500 on a DB error', async () => {
      supabase.from.mockReturnValueOnce(createQueryBuilder({ data: null, error: { message: 'down' } }));
      await expect(authService.getUserById('u1')).rejects.toMatchObject({ statusCode: 500 });
    });
  });
});
