import { imageUrl } from "../api.js";
import { el } from "../dom.js";
import { createIcon } from "./icons.js";

// Snittbetyg visas med svenskt decimalkomma, t.ex. 7,7.
const formatRating = (value) => String(value).replace(".", ",");

/**
 * Fyller betygsraden med stjärna och snittbetyg, t.ex. "★ 7,7/10 snittbetyg", eller "Snittbetyg saknas".
 * Används både vid första renderingen och när snittbetyget uppdateras efter en röst.
 * Stjärnan är dekorativ (aria-hidden); texten "snittbetyg" står alltid med.
 */
export const renderAvgRating = (ratingEl, avgRating) => {
  if (!(avgRating > 0)) {
    ratingEl.replaceChildren(el("span", "rating-none", "Snittbetyg saknas"));
    return;
  }
  const text = el("span");
  text.append(el("b", "rating-value", `${formatRating(avgRating)}/10`), " ", el("span", "rating-suffix", "snittbetyg"));
  ratingEl.replaceChildren(createIcon("star"), text);
};

const STATUS = {
  saved: { icon: "bookmark", label: "sparad" },
  read: { icon: "check", label: "läst" },
};

/**
 * Fyller titelrubriken: en diskret statusikon till höger på första raden (bara för sparad eller läst)
 * och bokens titel. Ikonen är dold för skärmläsare; i stället läggs statusen till som dold text efter
 * titeln ("En avlägsen kust (sparad)"). Platsen för ikonen är reserverad i alla kort, så titeln bryts
 * likadant oavsett status.
 */
const renderTitle = (titleEl, title, status) => {
  const info = STATUS[status];
  titleEl.replaceChildren();
  if (info) titleEl.append(el("span", "status-mark", null, { "aria-hidden": "true" }));
  if (info) titleEl.firstChild.append(createIcon(info.icon));
  titleEl.append(document.createTextNode(title));
  if (info) titleEl.append(el("span", "sr-only", ` (${info.label})`));
};

/** Uppdaterar statusikonen på ett befintligt kort. status: "saved", "read" eller undefined. */
export const setBookStatus = (card, book, status) => renderTitle(card.querySelector(".book-title"), book.title, status);

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
 * @param {"saved"|"read"} [options.status]  Statusikon vid titeln (ingen ikon för övriga böcker)
 * @returns {HTMLElement} kortet; betygsraden har klassen .book-rating
 */
export const createBookCard = (book, { loggedIn = true, avgRating, ratingLine, ratingSection, actions, headingLevel = 2, status } = {}) => {
  const card = el("article", loggedIn ? "book-card logged-in" : "book-card logged-out");

  const cover = el("div", "book-cover-container");
  cover.append(el("img", "book-cover", null, { src: imageUrl(book), alt: `Omslag: ${book.title}` }));

  const info = el("div", "book-info");
  const titleEl = el(`h${headingLevel}`, "book-title");
  renderTitle(titleEl, book.title, status);
  info.append(
    titleEl,
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
