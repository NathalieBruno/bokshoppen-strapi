// Modaler bygger på det inbyggda <dialog>-elementet: webbläsaren hanterar fokusfälla,
// Escape-tangent och återställning av fokus när dialogen stängs.
export const openModal = (dialog) => {
  if (dialog && !dialog.open) dialog.showModal();
};

export const closeModal = (dialog) => {
  if (dialog?.open) dialog.close();
};

// Klick på det mörka området utanför innehållet (klicket träffar <dialog> självt) stänger dialogen.
export const closeOnBackdropClick = (dialog) => {
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) closeModal(dialog);
  });
};

// Bekräftelsedialog som ersätter window.confirm(). Dialogen behöver ett element med
// data-confirm-text (frågetexten) och en knapp med data-confirm-ok. Löser till true om användaren
// bekräftar, annars false (Avbryt, stängknapp, Escape eller klick utanför).
export const confirmDialog = (dialog, message) =>
  new Promise((resolve) => {
    let confirmed = false;
    const okButton = dialog.querySelector("[data-confirm-ok]");

    const onOk = () => {
      confirmed = true;
      closeModal(dialog);
    };
    const onClose = () => {
      okButton.removeEventListener("click", onOk);
      resolve(confirmed);
    };

    dialog.querySelector("[data-confirm-text]").textContent = message;
    okButton.addEventListener("click", onOk);
    dialog.addEventListener("close", onClose, { once: true });
    openModal(dialog);
  });
