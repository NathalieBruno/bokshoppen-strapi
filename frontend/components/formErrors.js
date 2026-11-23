// Enkel formulärvalidering med felmeddelanden under fälten. Formulären har novalidate,
// så vi visar meddelandena själva (kopplade via aria-describedby) i stället för webbläsarens bubblor.
const showError = (input, message) => {
  const error = document.getElementById(`${input.id}-error`);
  input.setAttribute("aria-invalid", "true");
  error.textContent = message;
  error.hidden = false;
};

const clearError = (input) => {
  const error = document.getElementById(`${input.id}-error`);
  input.removeAttribute("aria-invalid");
  error.hidden = true;
};

// Returnerar true om alla fält är giltiga. Annars visas felen och fokus flyttas till första felaktiga fältet.
export const validateForm = (form) => {
  let firstInvalid = null;
  form.querySelectorAll("input[required]").forEach((input) => {
    if (input.checkValidity()) return clearError(input);
    const { errorRequired, errorInvalid } = input.dataset;
    showError(input, input.validity.valueMissing ? errorRequired : errorInvalid || errorRequired);
    firstInvalid ??= input;
  });
  firstInvalid?.focus();
  return !firstInvalid;
};

// Döljer ett fälts felmeddelande så fort användaren börjar skriva igen.
export const clearErrorsOnInput = (form) => {
  form.addEventListener("input", (e) => {
    if (e.target.matches("input[required]")) clearError(e.target);
  });
};
