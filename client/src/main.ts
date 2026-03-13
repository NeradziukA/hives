declare const __BUILD_DATE__: string;
console.log(`[Hives] Build date: ${__BUILD_DATE__}`);

import "./style.css";
import "./i18n";
import { mount } from "svelte";
import App from "./ui/App.svelte";

mount(App, { target: document.getElementById("app")! });
