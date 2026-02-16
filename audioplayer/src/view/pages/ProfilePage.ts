import { el } from "redom";
import { store } from "../../app/store";

export class ProfilePage {
  public el: HTMLElement;

  constructor() {
    this.el = el("section.profile",
      el("h1.profile__title", "Профиль"),
      el("div.profile__card",
        el("div.profile__avatar", "👤"),
        el("div.profile__meta",
          el("div.profile__name", store.username ?? "Пользователь"),
          el("div.profile__hint", "MVP-версия профиля (аватар-заглушка)")
        )
      )
    );
  }
}
