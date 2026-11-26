import { Api, DEMO_MODE } from "./api.js";
import { mountFooter } from "./components/siteFooter.js";
// Årstidstemat styr bakgrundsfärgen via data-season på <html> (färgerna ligger i style/_tokens.scss).
const THEME_LABELS = { spring: "Vår", summer: "Sommar", autumn: "Höst" };
const isTheme = (key) => Object.hasOwn(THEME_LABELS, key);

// Demoläge: besökaren väljer tema själv (normalt styrs det via Strapi CMS). Valet sparas i localStorage.
const DEMO_THEME_KEY = "bookducks-demo-theme";
const getDemoThemeChoice = () => {
  try {
    const choice = localStorage.getItem(DEMO_THEME_KEY);
    return isTheme(choice) ? choice : null;
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

// Senast visade årstiden sparas, så att nästa sida får rätt färg direkt medan temat hämtas.
const LAST_THEME_KEY = "bookducks-last-theme";
const getLastTheme = () => {
  try {
    const key = localStorage.getItem(LAST_THEME_KEY);
    return isTheme(key) ? key : null;
  } catch (e) {
    return null;
  }
};

const paintTheme = (key) => {
  document.documentElement.dataset.season = key;
  document.querySelectorAll(".theme-switcher button").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.theme === key));
  });
  try {
    localStorage.setItem(LAST_THEME_KEY, key);
  } catch (e) {
    // localStorage blockerad – nästa sida börjar med standardtemat
  }
};

const applyTheme = async () => {
  mountFooter({
    themeSwitcher: DEMO_MODE
      ? {
          labels: THEME_LABELS,
          onSelect: (choice) => {
            setDemoThemeChoice(choice);
            paintTheme(choice);
          },
        }
      : undefined,
  });

  const cached = (DEMO_MODE && getDemoThemeChoice()) || getLastTheme();
  if (cached) paintTheme(cached);

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
  }

  paintTheme(key);
};
export { applyTheme };
