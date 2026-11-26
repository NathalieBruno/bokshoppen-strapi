import { imageUrl } from "../api.js";
import { el } from "../dom.js";
import { createIcon } from "./icons.js";
import { createRating } from "./rating.js";

const STATUS = {
  saved: { icon: "bookmark", label: "sparad", filled: true },
  read: { icon: "check", label: "läst" },
};

/**
 * Fyller titelrubriken: en diskret statusikon till höger på första raden (ifyllt bokmärke för sparad, bock för läst)
 * och bokens titel. Ikonen är dold för skärmläsare; i stället läggs statusen till som dold text efter
 * titeln ("En avlägsen kust (sparad)"). Platsen för ikonen är reserverad i alla kort, så titeln bryts
 * likadant oavsett status.
 */
const renderTitle = (titleEl, title, status) => {
  const info = STATUS[status];
  titleEl.replaceChildren();
  if (info) titleEl.append(el("span", "status-mark", null, { "aria-hidden": "true" }));
  if (info) titleEl.firstChild.append(createIcon(info.icon, { filled: info.filled }));
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
 * @param {{label: string, value: number|string}} [options.rating]  Betygsrad, t.ex. { label: "Snittbetyg", value: 7.7 }
 * @param {HTMLElement|null} [options.ratingSection]  Betygsväljare; null ger en tom behållare
 * @param {HTMLElement[]} [options.actions]    Knappar längst ned; [] ger en tom behållare
 * @param {number} [options.headingLevel]  Nivå på titelrubriken (2 på startsidan, 3 under sektionsrubriker)
 * @param {"saved"|"read"} [options.status]  Statusikon vid titeln (ingen ikon för övriga böcker)
 * @returns {HTMLElement} kortet; betygsraden har klassen .book-rating (uppdateras med renderRating)
 */
export const createBookCard = (book, { loggedIn = true, rating, ratingSection, actions, headingLevel = 2, status } = {}) => {
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
  if (rating) {
    const ratingEl = createRating(rating);
    ratingEl.classList.add("book-rating");
    info.append(ratingEl);
  }

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
