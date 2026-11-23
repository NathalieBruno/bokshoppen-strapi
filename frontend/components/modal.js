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
