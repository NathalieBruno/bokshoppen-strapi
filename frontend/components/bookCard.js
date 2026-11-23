import { imageUrl } from "../api.js";
import { el } from "../dom.js";

// Snittbetyg som text, t.ex. "Snittbetyg: ⭐ 7.7/10". Används vid första rendering och vid uppdatering.
export const formatAvgRating = (avgRating) =>
  `Snittbetyg: ⭐ ${avgRating > 0 ? `${avgRating}/10` : "Saknar betyg"}`;

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
 * @returns {HTMLElement} kortet; betygsraden har klassen .book-rating
 */
export const createBookCard = (book, { loggedIn = true, avgRating, ratingLine, ratingSection, actions } = {}) => {
  const card = el("div", loggedIn ? "book-card logged-in" : "book-card logged-out");

  const cover = el("div", "book-cover-container");
  cover.append(el("img", "book-cover", null, { src: imageUrl(book), alt: `Omslag: ${book.title}` }));

  const info = el("div", "book-info");
  info.append(
    el("h3", "book-title", book.title),
    el("p", "book-author", book.author),
    el("p", "book-details", `Sidor: ${book.pages}`),
    el("p", "book-details", `Publicerad: ${book.publicationDate}`)
  );
  if (avgRating !== undefined) info.append(el("p", "book-rating", formatAvgRating(avgRating)));
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
