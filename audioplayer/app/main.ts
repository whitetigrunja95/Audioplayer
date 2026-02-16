import "../styles/main.scss";
import { mount } from "redom";
import { initRouter } from "./router";
import { subscribe } from "./store";
import { AppShell } from "../view/layout/AppShell";

const app = new AppShell();
mount(document.body, app.el);

initRouter();

subscribe((state) => {
  app.update(state);
});
