import { describe, it, expect } from 'vitest';
import { config } from '../../src/config';

describe('Environment Config', () => {
  it('should have valid config loaded', () => {
    expect(config).toBeDefined();
    expect(config.env).toBeDefined();
    expect(config.port).toBeDefined();
    expect(config.database.url).toBeDefined();
  });

  it('should have required database URL', () => {
    expect(config.database.url).toBeTruthy();
  });

  it('should have JWT secrets configured', () => {
    expect(config.jwt.accessSecret.length).toBeGreaterThanOrEqual(16);
    expect(config.jwt.refreshSecret.length).toBeGreaterThanOrEqual(16);
  });
});


