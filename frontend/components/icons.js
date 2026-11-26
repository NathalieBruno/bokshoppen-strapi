// Små SVG-ikoner som byggs med DOM-API:et. Alla är dekorativa (aria-hidden): betydelsen ska alltid
// finnas som text bredvid, antingen synlig eller dold för skärmläsare.
const SVG_NS = "http://www.w3.org/2000/svg";

const ICONS = {
  // Linjeikon: diskret stjärna för betyg
  star: { viewBox: "0 0 20 20", strokeWidth: 1.75, d: "M10 1.8l2.4 5.1 5.6.7-4.1 3.9 1 5.6L10 14.4l-4.9 2.7 1-5.6L2 7.6l5.6-.7z" },
  // Linjeikoner: bokmärke (sparad / Spara bok), bock (läst), papperskorg (ta bort), penna (ändra)
  bookmark: { viewBox: "0 0 24 24", d: "M6 3.5h12v17l-6-4.2-6 4.2z" },
  check: { viewBox: "0 0 24 24", d: "M5 12.5l4.5 4.5L19 7.5" },
  trash: { viewBox: "0 0 24 24", d: "M4 7h16M9 7V4.5h6V7M6.5 7l.8 12.5h9.4L17.5 7M10 11v5M14 11v5" },
  pencil: { viewBox: "0 0 24 24", d: "M4 20l1-4L16.5 4.5a2 2 0 013 3L8 19z" },
};

/** @param {string} name  @param {{filled?: boolean}} [options]  filled fyller linjeikonen med sin färg */
export const createIcon = (name, { filled = false } = {}) => {
  const { viewBox, d, strokeWidth = 2.2 } = ICONS[name];
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", viewBox);
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.setAttribute("fill", filled ? "currentColor" : "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", String(strokeWidth));
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", d);
  svg.append(path);
  return svg;
};
