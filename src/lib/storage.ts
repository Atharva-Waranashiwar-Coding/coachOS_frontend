const ACCESS_TOKEN_KEY = "coachos.access-token";

let memoryToken: string | null = null;

export const tokenStorage = {
  get(): string | null {
    if (memoryToken) return memoryToken;
    memoryToken = window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
    return memoryToken;
  },
  set(token: string): void {
    memoryToken = token;
    window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  clear(): void {
    memoryToken = null;
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  },
};
