import { imageUrl } from "../api.js";
import { el } from "../dom.js";

const SVG_NS = "http://www.w3.org/2000/svg";

const createStarIcon = () => {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 20 20");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", "M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L1.4 7.8l6-.8z");
  svg.append(path);
  return svg;
};

/**
 * Fyller betygsraden med stjärna och snittbetyg, t.ex. "★ 7.7/10", eller "Saknar betyg".
 * Används både vid första renderingen och när snittbetyget uppdateras efter en röst.
 * Skärmläsare får "Snittbetyg: …"; stjärnan är dekorativ.
 */
export const renderAvgRating = (ratingEl, avgRating) => {
  ratingEl.replaceChildren(createStarIcon(), el("span", "sr-only", "Snittbetyg: "));
  ratingEl.append(
    avgRating > 0 ? el("span", "rating-value", `${avgRating}/10`) : el("span", "rating-none", "Saknar betyg")
  );
};

/**
 * Bygger ett bokkort. Komponenten gör inga API-anrop – all data och alla
 * händelsehanterare kommer utifrån, så samma kort kan användas på alla sidor.
 *
 * @param {object} book                    Bok från API:et (title, author, pages, publicationDate, image)
 * @param {object} [options]
 * @param {boolean} [options.loggedIn]     Styr kortets padding (utrymme för knappar)
 * @param {string|number} [options.avgRating]  Visar raden "Snittbetyg" när värdet skickas in
 * @param {HTMLElement} [options.ratingLine]   Egen betygsrad (t.ex. "Ditt betyg: 8")
 * @param {HTMLElement|null} [options.ratingSection]  Betygsväljare; null ger en tom behållare
 * @param {HTMLElement[]} [options.actions]    Knappar längst ned; [] ger en tom behållare
 * @param {number} [options.headingLevel]  Nivå på titelrubriken (2 på startsidan, 3 under sektionsrubriker)
 * @returns {HTMLElement} kortet; betygsraden har klassen .book-rating
 */
export const createBookCard = (book, { loggedIn = true, avgRating, ratingLine, ratingSection, actions, headingLevel = 2 } = {}) => {
  const card = el("article", loggedIn ? "book-card logged-in" : "book-card logged-out");

  const cover = el("div", "book-cover-container");
  cover.append(el("img", "book-cover", null, { src: imageUrl(book), alt: `Omslag: ${book.title}` }));

  const info = el("div", "book-info");
  info.append(
    el(`h${headingLevel}`, "book-title", book.title),
    el("p", "book-author", book.author),
    el("p", "book-details", `${book.pages} sidor · ${String(book.publicationDate).slice(0, 4)}`)
  );
  if (avgRating !== undefined) {
    const ratingEl = el("p", "book-rating");
    renderAvgRating(ratingEl, avgRating);
    info.append(ratingEl);
  }
  if (ratingLine) info.append(ratingLine);

  card.append(cover, info);

  if (ratingSection !== undefined) {
    const container = el("div", "rating-section-container");
    if (ratingSection) container.append(ratingSection);
    card.append(container);
  }
  if (actions !== undefined) {
    card.append(el("div", "button-container"));
    card.lastElementChild.append(...actions);
  }

  return card;
};
