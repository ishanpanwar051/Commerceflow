import { test, expect, beforeAll } from 'vitest';

beforeAll(() => {
  console.log('NODE_ENV=', process.env.NODE_ENV);
});

test('check NODE_ENV is test', () => {
  console.log('NODE_ENV inside test:', process.env.NODE_ENV);
  expect(process.env.NODE_ENV).toBe('test');
});
