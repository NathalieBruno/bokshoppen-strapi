import { Api } from "../api.js";
import { el } from "../dom.js";
import { createRatingSelect } from "./ratingSelect.js";
import { closeModal, closeOnBackdropClick, openModal } from "./modal.js";

// Dialogen "Jag har läst boken": användaren betygsätter boken, betyget sparas och boken tas bort
// från sparade böcker om den låg där. Dialogen byggs första gången den öppnas och återanvänds sedan,
// så samma flöde kan användas på både startsidan och profilsidan.
let parts = null;

const build = () => {
  const dialog = el("dialog", "modal", null, { "aria-labelledby": "read-title", "aria-describedby": "read-text" });
  const inner = el("div", "modal-inner");
  const closeButton = el("button", "close", "×", { type: "button", "aria-label": "Stäng" });
  const text = el("p", "modal-sub", null, { id: "read-text" });
  const ratingSlot = el("div");
  const error = el("p", "field-error", "Välj ett betyg först.", { id: "read-error", hidden: "" });
  const cancelButton = el("button", "btn", "Avbryt", { type: "button" });
  const saveButton = el("button", "btn btn-primary", "Spara", { type: "button" });
  const actions = el("div", "confirm-actions");

  const heading = el("h2", null, "Vad tyckte du?", { id: "read-title" });

  actions.append(cancelButton, saveButton);
  inner.append(closeButton, heading, text, ratingSlot, error, actions);
  dialog.append(inner);
  document.body.append(dialog);

  closeOnBackdropClick(dialog);
  [closeButton, cancelButton].forEach((button) => button.addEventListener("click", () => closeModal(dialog)));

  const built = { dialog, heading, text, ratingSlot, error, saveButton, onSave: null };
  saveButton.addEventListener("click", () => built.onSave?.());
  return built;
};

/**
 * Öppnar dialogen för en bok. Inget sparas eller flyttas förrän användaren trycker på Spara.
 *
 * @param {object} options
 * @param {object} options.book            Boken som markeras som läst (behöver documentId)
 * @param {string} options.userId          Inloggad användares documentId
 * @param {object|null} [options.wishlistItem]  Bokens post bland sparade böcker (tas bort när betyget sparats)
 * @param {string} options.text            Förklarande text under rubriken
 * @param {string} [options.heading]       Rubrik (standard "Vad tyckte du?")
 * @param {number|null} [options.currentRating]  Förvalt betyg, t.ex. när ett befintligt betyg ändras
 * @param {string} [options.successMessage]  Egen bekräftelse efter lyckat sparande
 * @param {Function} [options.onDone]      Anropas efter lyckat betyg med { rating, removed }
 */
export const openReadDialog = ({ book, userId, wishlistItem = null, text, heading, currentRating = null, successMessage, onDone }) => {
  parts ??= build();
  const { dialog, heading: headingEl, text: textEl, ratingSlot, error, saveButton } = parts;
  headingEl.textContent = heading ?? "Vad tyckte du?";
  textEl.textContent = text;
  error.hidden = true;
  saveButton.disabled = false;

  // Rullgardinen bara väljer betyg; sparandet sker först vid klick på Spara.
  const picker = createRatingSelect(currentRating, () => {
    error.hidden = true;
    select.removeAttribute("aria-invalid");
  });
  const select = picker.querySelector("select");
  select.setAttribute("aria-describedby", "read-error");

  parts.onSave = async () => {
    const rating = parseInt(select.value);
    if (!rating) {
      error.hidden = false;
      select.setAttribute("aria-invalid", "true");
      select.focus();
      return;
    }

    // Låser formuläret medan betyget sparas så att det inte kan skickas två gånger.
    select.disabled = true;
    saveButton.disabled = true;

    let saved = false;
    try {
      saved = await Api.rateBook(userId, book.documentId, rating);
    } catch (err) {
      console.error("Fel vid sparande av betyg:", err);
    }
    if (!saved) {
      toastr.error("Kunde inte spara betyget, försök igen");
      select.disabled = false;
      saveButton.disabled = false;
      return;
    }

    const removed = wishlistItem ? await Api.deleteWishlistItem(wishlistItem.documentId) : true;
    closeModal(dialog);
    if (!removed) toastr.warning("Betyget sparades, men boken kunde inte tas bort från sparade böcker");
    else if (successMessage) toastr.success(successMessage);
    else if (wishlistItem) toastr.success("Boken är flyttad till dina lästa böcker!");
    else toastr.success("Boken är markerad som läst!");

    onDone?.({ rating, removed });
  };

  ratingSlot.replaceChildren(picker);
  openModal(dialog);
};
