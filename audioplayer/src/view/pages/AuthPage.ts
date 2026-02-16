import { el } from "redom";
import { loginUser, registerUser } from "../../api/auth";
import { session } from "../../model/session";
import { navigate } from "../../app/router";
import { setState, setError } from "../../app/store";

export class AuthPage {
  public el: HTMLElement;

  constructor() {
    const username = el("input.auth__input", { placeholder: "username" }) as HTMLInputElement;
    const password = el("input.auth__input", { placeholder: "password", type: "password" }) as HTMLInputElement;
    const msg = el("div.auth__msg");

    const loginBtn = el("button.auth__btn", { onclick: async () => {
      setError(null);
      msg.textContent = "";
      try {
        const res = await loginUser({ username: username.value.trim(), password: password.value });
        if (!res.token) throw new Error("Token missing");
        session.setToken(res.token);
        setState({ username: username.value.trim() });
        navigate("tracks");
      } catch (e) {
        msg.textContent = "Не удалось войти. Проверь данные и сервер.";
      }
    }}, "Войти") as HTMLButtonElement;

    const regBtn = el("button.auth__btn auth__btn--ghost", { onclick: async () => {
      msg.textContent = "";
      try {
        await registerUser({ username: username.value.trim(), password: password.value });
        msg.textContent = "Пользователь создан. Теперь нажми «Войти».";
      } catch {
        msg.textContent = "Не удалось зарегистрироваться (возможно, пользователь уже есть).";
      }
    }}, "Регистрация") as HTMLButtonElement;

    this.el = el("section.auth",
      el("h1.auth__title", "Авторизация"),
      el("div.auth__form",
        username,
        password,
        el("div.auth__actions", loginBtn, regBtn),
        msg
      )
    );
  }
}
