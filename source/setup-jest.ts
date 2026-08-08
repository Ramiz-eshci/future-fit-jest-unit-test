import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const storage: Record<string, string> = {};

beforeEach(() => {
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => storage[key] ?? undefined);
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
    storage[key] = String(value);
  });
  jest.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => {
    delete storage[key];
  });
  jest.spyOn(Storage.prototype, 'clear').mockImplementation(() => {
    Object.keys(storage).forEach((key) => delete storage[key]);
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});