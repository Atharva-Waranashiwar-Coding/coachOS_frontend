let requestedRoute: string | null = null;

export function setRequestedRoute(path: string): void {
  requestedRoute = path;
}

export function getRequestedRoute(): string | null {
  return requestedRoute;
}

export function clearRequestedRoute(): void {
  requestedRoute = null;
}
