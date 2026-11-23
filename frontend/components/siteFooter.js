import { Api, pageUrl } from "../api.js";
import { el } from "../dom.js";

/**
 * Bygger och monterar sidfoten (en gång per sida): namn, sidlänkar och © på alla sidor.
 * Temaväxlaren visas bara när `themeSwitcher` skickas in (demoläget); i Strapi-läget styrs temat av CMS:et.
 *
 * @param {object} [options]
 * @param {{ labels: Record<string,string>, onSelect: (key: string) => void }} [options.themeSwitcher]
 */
export const mountFooter = ({ themeSwitcher } = {}) => {
  if (document.querySelector(".site-footer")) return;

  const footer = el("footer", "site-footer");

  const brand = el("div", "footer-brand");
  brand.append(
    el("p", "footer-name", "Lilla Bokshoppen"),
    el("p", null, "Bokklubben där vi läser, betygsätter och tipsar varandra om nästa bok.")
  );

  const nav = el("nav", null, null, { "aria-label": "Sidor" });
  const navList = el("ul", "footer-nav");
  const addLink = (text, page) => {
    const item = el("li");
    item.append(el("a", null, text, { href: pageUrl(page) }));
    navList.append(item);
  };
  addLink("Månadens böcker", "index.html");
  if (Api.getAuthHeader()) addLink("Din profil", "user/profile.html");
  nav.append(el("h2", "footer-title", "Sidor"), navList);

  const main = el("div", "wrap footer-main");
  main.append(brand, nav);
  if (themeSwitcher) main.append(createThemeSwitcher(themeSwitcher));

  const base = el("div", "footer-base");
  const baseWrap = el("div", "wrap");
  baseWrap.append(el("span", null, `© ${new Date().getFullYear()} Lilla Bokshoppen`));
  if (themeSwitcher) baseWrap.append(el("span", null, "Demoversion"));
  base.append(baseWrap);

  footer.append(main, base);
  document.body.append(footer);
};

const createThemeSwitcher = ({ labels, onSelect }) => {
  const wrapper = el("div", "theme-switcher");
  const group = el("span", "segmented", null, { role: "group", "aria-labelledby": "theme-label" });
  Object.entries(labels).forEach(([key, label]) => {
    group.append(el("button", null, label, { type: "button", "data-theme": key, "aria-pressed": "false" }));
  });
  group.addEventListener("click", (e) => {
    const key = e.target.dataset?.theme;
    if (key) onSelect(key);
  });
  wrapper.append(
    el("h2", "footer-title", "Tema", { id: "theme-label" }),
    group,
    el("p", "theme-note", "Demoversion: temat styrs normalt via Strapi CMS.")
  );
  return wrapper;
};
