import { Api, DEMO_MODE } from "./api.js";
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

const paintTheme = (key) => {
  document.documentElement.dataset.season = key;
  document.querySelectorAll(".theme-switcher button").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.theme === key));
  });
};

const addThemeSwitcher = () => {
  if (document.querySelector(".site-footer")) return;
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="theme-switcher" role="group" aria-labelledby="theme-switcher-label">
      <span class="theme-switcher-label" id="theme-switcher-label">Tema</span>
      <span class="theme-switcher-options">
        ${Object.keys(THEME_LABELS)
          .map((key) => `<button type="button" data-theme="${key}" aria-pressed="false">${THEME_LABELS[key]}</button>`)
          .join("")}
      </span>
      <span class="theme-switcher-note">Demoversion – temat styrs normalt via Strapi CMS.</span>
    </div>
  `;
  footer.addEventListener("click", (e) => {
    const key = e.target.dataset?.theme;
    if (!isTheme(key)) return;
    setDemoThemeChoice(key);
    paintTheme(key);
  });
  document.body.classList.add("has-site-footer");
  document.body.append(footer);
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
