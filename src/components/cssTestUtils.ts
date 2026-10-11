// Helpers de test: JSDOM no evalúa media queries, así que se inspecciona el
// CSS que emotion inyectó para las clases del elemento.
const collect = (rules: CSSRuleList, out: string[]) => {
  Array.from(rules).forEach((rule) => {
    out.push(rule.cssText);
    const nested = (rule as CSSGroupingRule).cssRules;
    if (nested) collect(nested, out);
  });
};

export const cssFor = (el: Element): string => {
  const all: string[] = [];
  Array.from(document.styleSheets).forEach((sheet) =>
    collect(sheet.cssRules, all),
  );
  const classes = Array.from(el.classList).filter((c) => c.startsWith("css-"));
  return all.filter((text) => classes.some((c) => text.includes(`.${c}`))).join("\n");
};

// Variantes que suben por el DOM desde un elemento obtenido con Testing
// Library (el lint prohíbe el acceso directo a nodos dentro de los tests).
export const cssForParent = (el: Element): string =>
  el.parentElement ? cssFor(el.parentElement) : "";

export const cssForClosest = (el: Element, selector: string): string => {
  const found = el.closest(selector);
  return found ? cssFor(found) : "";
};

export const cssForSelector = (selector: string): string => {
  const found = document.querySelector(selector);
  return found ? cssFor(found) : "";
};
