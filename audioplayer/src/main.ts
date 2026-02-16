import "./styles/main.scss";
import { mount } from "redom";

import { initRouter } from "./app/router";
import { subscribe } from "./app/store";
import { AppShell } from "./view/layout/AppShell";

const root = document.getElementById("app");
if (!root) throw new Error("Не найден #app");

const app = new AppShell();
mount(root, app.el);

initRouter();

subscribe((state) => {
  app.update(state);
});
