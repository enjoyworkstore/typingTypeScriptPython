import { defineConfig } from "vite";

const REPOSITORY_NAME = "typingTypeScriptPython";

export default defineConfig(({ command }) => ({
  // GitHub Pages project site serves under /<repository>/.
  base: command === "build" ? `/${REPOSITORY_NAME}/` : "/",
}));
