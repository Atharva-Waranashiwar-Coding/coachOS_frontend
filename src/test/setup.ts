import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { tokenStorage } from "../lib/storage";
import { server } from "./server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  tokenStorage.clear();
  window.history.replaceState({}, "", "/");
});
afterAll(() => server.close());
Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });
