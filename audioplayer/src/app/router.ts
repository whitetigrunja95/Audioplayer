import type { Route } from "../model/types";
import { setState } from "./store";

function parseRoute(): Route {
  const hash = window.location.hash.replace("#/", "");
  if (hash === "tracks" || hash === "favorites" || hash === "profile" || hash === "auth") {
    return hash;
  }
  return "auth";
}

export function navigate(route: Route): void {
  window.location.hash = `#/${route}`;
}

export function initRouter(): void {
  const apply = () => setState({ route: parseRoute() });
  window.addEventListener("hashchange", apply);
  apply();
}
