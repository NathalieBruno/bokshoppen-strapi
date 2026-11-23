// Liten hjälpfunktion för att bygga DOM-element säkert: text sätts alltid med textContent,
// så data från API:et (titlar, användarnamn m.m.) kan aldrig tolkas som HTML.
export const el = (tag, className, text, attrs = {}) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  Object.entries(attrs).forEach(([name, value]) => node.setAttribute(name, value));
  return node;
};
