import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppProviders } from "../app/providers";
import { AppRouter } from "../app/router";

export function renderApp(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </MemoryRouter>,
  );
}

export function authenticate(): void {
  window.sessionStorage.setItem("coachos.access-token", "valid-token");
}
