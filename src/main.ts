import "./style.css";
import { TypingForEnjoyApp } from "./app";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("App root was not found.");
}

new TypingForEnjoyApp(root);
