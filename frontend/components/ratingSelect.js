import { el } from "../dom.js";

let nextId = 0;

/**
 * Betygsväljare 1–10. Gör inga API-anrop: onRate(rating) anropas när användaren väljer ett betyg.
 * Etiketten är kopplad till <select> via for/id.
 */
export const createRatingSelect = (currentRating, onRate) => {
  const id = `rating-select-${nextId++}`;
  const wrapper = el("div", "rating-container");
  const section = el("div", "rating-section");
  const label = el("label", null, "Ge boken ett betyg:", { for: id });
  const select = el("select", "rating-select", null, { id });

  select.append(el("option", null, "Välj betyg", { value: "" }));
  for (let value = 1; value <= 10; value++) {
    select.append(el("option", null, String(value), { value: String(value) }));
  }
  if (currentRating) select.value = currentRating;

  select.addEventListener("change", () => {
    const rating = parseInt(select.value);
    if (rating) onRate(rating);
  });

  section.append(label, select);
  wrapper.append(section);
  return wrapper;
};
