import { el, mount } from "redom";
import type { AppState } from "../../app/store";
import { navigate } from "../../app/router";
import { session } from "../../model/session";

import { AuthPage } from "../pages/AuthPage";
import { TracksPage } from "../pages/TracksPage";
import { FavoritesPage } from "../pages/FavoritesPage";
import { ProfilePage } from "../pages/ProfilePage";
import { PlayerBar } from "../components/PlayerBar";

type PageInstance = { el: HTMLElement; destroy?: () => void };

export class AppShell {
  private outlet = el("main.app__outlet");
  private playerHost = el("div.app__player-host");

  private header = el(
    "header.app__header",
    el("div.app__brand", "🎧 Аудиоплеер"),
    el("div.app__spacer"),
    el(
      "button.app__logout",
      {
        onclick: () => {
          session.clear();
          navigate("auth");
        },
      },
      "Выйти"
    )
  );

  private nav = el(
    "nav.app__nav",
    el("button.app__nav-btn", { onclick: () => navigate("tracks") }, "Треки"),
    el("button.app__nav-btn", { onclick: () => navigate("favorites") }, "Избранное"),
    el("button.app__nav-btn", { onclick: () => navigate("profile") }, "Профиль")
  );

  private player = new PlayerBar();

  public el = el("div.app", this.header, this.nav, this.outlet, this.playerHost);

  private page: PageInstance | null = null;

  // 🔥 ключевой фикс: рендер страницы только при смене route
  private lastRoute: AppState["route"] | null = null;

  update(state: AppState): void {
    const loggedIn = Boolean(session.getToken());

    this.header.style.display = loggedIn ? "" : "none";
    this.nav.style.display = loggedIn ? "" : "none";
    this.playerHost.style.display = loggedIn ? "" : "none";

    // ✅ рендерим страницу только когда изменился route
    if (state.route !== this.lastRoute) {
      this.lastRoute = state.route;
      this.renderRoute(state.route);
    }

    // ✅ плеер обновляем всегда
    this.player.update(state);

    if (!this.playerHost.hasChildNodes()) {
      mount(this.playerHost, this.player.el);
    }
  }

  private renderRoute(route: AppState["route"]): void {
    if (this.page) {
      this.page.destroy?.();
      this.outlet.innerHTML = "";
      this.page = null;
    }

    switch (route) {
      case "auth":
        this.page = new AuthPage();
        break;
      case "tracks":
        this.page = new TracksPage();
        break;
      case "favorites":
        this.page = new FavoritesPage();
        break;
      case "profile":
        this.page = new ProfilePage();
        break;
    }

    mount(this.outlet, this.page.el);
  }
}
