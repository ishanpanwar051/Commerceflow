import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import { AuthService } from '../../../src/services/authService';
import { UserRepository } from '../../../src/repositories';
import { BadRequestError, NotFoundError } from '../../../src/utils/errors';

const { mockAddJob, mockPrismaFindFirst } = vi.hoisted(() => ({
  mockAddJob: vi.fn(),
  mockPrismaFindFirst: vi.fn(),
}));

vi.mock('../../../src/workers/queue', () => ({ addJob: mockAddJob }));
vi.mock('../../../src/config/database', () => ({ getPrisma: () => ({ user: { findFirst: mockPrismaFindFirst } }) }));
vi.mock('../../../src/repositories', () => ({ UserRepository: vi.fn() }));
vi.mock('../../../src/config/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock('../../../src/config', () => ({
  config: {
    jwt: { accessSecret: 'test-access-secret-1234567890123456', refreshSecret: 'test-refresh-secret-1234567890123456', accessExpiresIn: '15m', refreshExpiresIn: '7d' },
  },
}));
vi.mock('jsonwebtoken', () => ({ default: { sign: vi.fn(() => 'mocked-jwt-token') }, sign: vi.fn(() => 'mocked-jwt-token') }));

describe('AuthService — Email Token Security Fix', () => {
  let authService: AuthService;
  let mockRepo: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo = {
      findByEmail: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      createRefreshToken: vi.fn(),
    };
    (UserRepository as any).mockImplementation(() => mockRepo);
    authService = new AuthService();
  });

  describe('register', () => {
    it('should store SHA256 hash of email token, not plaintext', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue({ id: 'user-1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'CUSTOMER' });

      await authService.register({ email: 'test@example.com', password: 'Password1!', firstName: 'Test', lastName: 'User' });

      const storedToken = mockRepo.create.mock.calls[0][0].emailToken;
      expect(storedToken).toMatch(/^[a-f0-9]{64}$/);
      expect(storedToken).not.toContain('-');

      const rawEmailToken = mockAddJob.mock.calls[0][1].token;
      const expectedHash = crypto.createHash('sha256').update(rawEmailToken).digest('hex');
      expect(storedToken).toBe(expectedHash);
    });
  });

  describe('verifyEmail', () => {
    it('should hash token before DB lookup', async () => {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      mockPrismaFindFirst.mockResolvedValue({ id: 'user-1', isEmailVerified: false });

      await authService.verifyEmail(rawToken);

      const lookupArg = mockPrismaFindFirst.mock.calls[0][0];
      expect(lookupArg.where.emailToken).toBe(hashedToken);
      expect(lookupArg.where.emailToken).not.toBe(rawToken);
    });

    it('should throw BadRequestError for invalid token', async () => {
      mockPrismaFindFirst.mockResolvedValue(null);
      await expect(authService.verifyEmail('invalid-token')).rejects.toThrow(BadRequestError);
    });

    it('should throw for empty token', async () => {
      mockPrismaFindFirst.mockResolvedValue(null);
      await expect(authService.verifyEmail('')).rejects.toThrow(BadRequestError);
    });
  });

  describe('resendVerification', () => {
    it('should hash new token before storing', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'user-1', email: 'test@example.com', isEmailVerified: false });
      mockRepo.update.mockResolvedValue({});

      await authService.resendVerification('user-1');

      const storedToken = mockRepo.update.mock.calls[0][1].emailToken;
      expect(storedToken).toMatch(/^[a-f0-9]{64}$/);

      const rawToken = mockAddJob.mock.calls[0][1].token;
      const expectedHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      expect(storedToken).toBe(expectedHash);
    });

    it('should throw NotFoundError for missing user', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(authService.resendVerification('nonexistent')).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError if already verified', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'user-1', isEmailVerified: true });
      await expect(authService.resendVerification('user-1')).rejects.toThrow(BadRequestError);
    });
  });
});
