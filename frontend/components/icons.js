// Små SVG-ikoner som byggs med DOM-API:et. Alla är dekorativa (aria-hidden): betydelsen ska alltid
// finnas som text bredvid, antingen synlig eller dold för skärmläsare.
const SVG_NS = "http://www.w3.org/2000/svg";

const ICONS = {
  // Fylld stjärna (snittbetyg)
  star: { viewBox: "0 0 20 20", filled: true, d: "M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L1.4 7.8l6-.8z" },
  // Linjeikoner: bokmärke (sparad / Läs senare) och bock (läst)
  bookmark: { viewBox: "0 0 24 24", d: "M6 3.5h12v17l-6-4.2-6 4.2z" },
  check: { viewBox: "0 0 24 24", d: "M5 12.5l4.5 4.5L19 7.5" },
};

export const createIcon = (name) => {
  const { viewBox, d, filled } = ICONS[name];
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", viewBox);
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  if (!filled) {
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2.2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
  }
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", d);
  svg.append(path);
  return svg;
};
