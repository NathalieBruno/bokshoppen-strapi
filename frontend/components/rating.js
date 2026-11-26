import { el } from "../dom.js";
import { createIcon } from "./icons.js";

// Betyg med svenskt decimalkomma, t.ex. 7,7.
const formatRating = (value) => String(value).replace(".", ",");

/**
 * Fyller en betygsrad: etikett i meningsform ovanför ("Snittbetyg", "Ditt betyg") och därunder en
 * diskret stjärna med hela värdet, t.ex. "7,7/10", i samma typsnitt, storlek, vikt och färg.
 * Samma komponent används på startsidan (snittbetyg) och profilsidan (eget betyg).
 * Stjärnan är dekorativ (aria-hidden); etiketten och värdet är text och läses upp som "Snittbetyg 7,7/10".
 *
 * @param {HTMLElement} ratingEl  Elementet som fylls
 * @param {{label: string, value: number|string}} rating  value saknas eller 0 ger "Inget betyg än"
 */
export const renderRating = (ratingEl, { label, value }) => {
  const valueEl = el("span", "rating-value");
  if (Number(value) > 0) {
    valueEl.append(createIcon("star"), el("span", null, `${formatRating(value)}/10`));
  } else {
    valueEl.classList.add("rating-value--none");
    valueEl.textContent = "Inget betyg än";
  }
  ratingEl.replaceChildren(el("span", "rating-label", label), valueEl);
};

export const createRating = (rating) => {
  const ratingEl = el("p", "rating");
  renderRating(ratingEl, rating);
  return ratingEl;
};
