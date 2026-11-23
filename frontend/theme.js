import { Api, DEMO_MODE } from "./api.js";
//bakgrunderna hämtade jag från :https://heropatterns.com/
let SPRING_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.20'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";
let SUMMER_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.20'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

let AUTUMN_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.20'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

const THEMES = {
  spring: {
    color: "#f0ffe0",
    pattern: SPRING_PATTERN,
  },
  summer: {
    color: "#e6f7ff",
    pattern: SUMMER_PATTERN,
  },
  autumn: {
    color: "#F1DDCC",
    pattern: AUTUMN_PATTERN,
  },
};

// Demoläge: besökaren väljer tema själv (normalt styrs det via Strapi CMS). Valet sparas i localStorage.
const DEMO_THEME_KEY = "bookducks-demo-theme";
const THEME_LABELS = { spring: "Vår", summer: "Sommar", autumn: "Höst" };

const getDemoThemeChoice = () => {
  try {
    const choice = localStorage.getItem(DEMO_THEME_KEY);
    return THEMES[choice] ? choice : null;
  } catch (e) {
    return null;
  }
};

const setDemoThemeChoice = (key) => {
  try {
    localStorage.setItem(DEMO_THEME_KEY, key);
  } catch (e) {
    // localStorage blockerad – valet gäller bara på den här sidan
  }
};

const paintTheme = (key) => {
  document.body.style.backgroundColor = THEMES[key].color;
  document.body.style.backgroundImage = THEMES[key].pattern;
  document.querySelectorAll(".theme-switcher button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.theme === key);
  });
};

const addThemeSwitcher = () => {
  if (document.querySelector(".theme-switcher")) return;
  const switcher = document.createElement("div");
  switcher.className = "theme-switcher";
  switcher.innerHTML = `
    <span class="theme-switcher-label">Tema</span>
    ${Object.keys(THEMES)
      .map((key) => `<button type="button" data-theme="${key}">${THEME_LABELS[key]}</button>`)
      .join("")}
    <span class="theme-switcher-note">Styrs normalt via Strapi CMS</span>
  `;
  switcher.addEventListener("click", (e) => {
    const key = e.target.dataset?.theme;
    if (!THEMES[key]) return;
    setDemoThemeChoice(key);
    paintTheme(key);
  });
  document.body.append(switcher);
};

const applyTheme = async () => {
  let key = "summer";
  const data = await Api.getTheme();

  if (data) {
    if (data.IsSpring === true) {
      key = "spring";
    } else if (data.IsAutumn === true) {
      key = "autumn";
    }
  }

  if (DEMO_MODE) {
    key = getDemoThemeChoice() || key;
    addThemeSwitcher();
  }

  paintTheme(key);
};
export { applyTheme };
