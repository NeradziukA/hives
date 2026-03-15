import { addMessages, init, locale } from "svelte-i18n";
import en from "./en.json";
import ru from "./ru.json";

addMessages("en", en);
addMessages("ru", ru);

const STORAGE_KEY = "clientLang";
const saved = localStorage.getItem(STORAGE_KEY);
const initialLocale = saved === "ru" ? "ru" : "en";

init({
  fallbackLocale: "en",
  initialLocale,
});

locale.subscribe((lang) => {
  if (lang) localStorage.setItem(STORAGE_KEY, lang);
});
