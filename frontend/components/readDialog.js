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
  const cancelButton = el("button", "btn", "Avbryt", { type: "button" });
  const actions = el("div", "confirm-actions");

  actions.append(cancelButton);
  inner.append(closeButton, el("h2", null, "Vad tyckte du?", { id: "read-title" }), text, ratingSlot, actions);
  dialog.append(inner);
  document.body.append(dialog);

  closeOnBackdropClick(dialog);
  [closeButton, cancelButton].forEach((button) => button.addEventListener("click", () => closeModal(dialog)));

  return { dialog, text, ratingSlot };
};

/**
 * Öppnar dialogen för en bok.
 *
 * @param {object} options
 * @param {object} options.book            Boken som markeras som läst (behöver documentId)
 * @param {string} options.userId          Inloggad användares documentId
 * @param {object|null} [options.wishlistItem]  Bokens post bland sparade böcker (tas bort när betyget sparats)
 * @param {string} options.text            Förklarande text under rubriken
 * @param {Function} [options.onDone]      Anropas efter lyckat betyg med { rating, removed }
 */
export const openReadDialog = ({ book, userId, wishlistItem = null, text, onDone }) => {
  parts ??= build();
  const { dialog, text: textEl, ratingSlot } = parts;
  textEl.textContent = text;

  const picker = createRatingSelect(null, async (rating) => {
    const select = picker.querySelector("select");
    select.disabled = true; // förhindrar dubbla anrop medan betyget sparas

    let saved = false;
    try {
      saved = await Api.rateBook(userId, book.documentId, rating);
    } catch (err) {
      console.error("Fel vid sparande av betyg:", err);
    }
    if (!saved) {
      toastr.error("Kunde inte spara betyget, försök igen");
      select.disabled = false;
      select.value = "";
      return;
    }

    const removed = wishlistItem ? await Api.deleteWishlistItem(wishlistItem.documentId) : true;
    closeModal(dialog);
    if (!removed) toastr.warning("Betyget sparades, men boken kunde inte tas bort från sparade böcker");
    else if (wishlistItem) toastr.success("Boken är flyttad till dina lästa böcker!");
    else toastr.success("Boken är markerad som läst!");

    onDone?.({ rating, removed });
  });

  ratingSlot.replaceChildren(picker);
  openModal(dialog);
};
