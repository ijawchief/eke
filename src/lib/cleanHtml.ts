/**
 * Strip all inline styles, forbidden attributes, font tags, and empty inline
 * wrappers from HTML produced by contentEditable / paste.
 * Uses DOMParser (client-only) for reliable parsing.
 */
export function cleanHtml(html: string): string {
  if (!html) return "";
  if (typeof window === "undefined") {
    // SSR fallback — regex strip of the most common offenders
    return html
      .replace(/\s+style="[^"]*"/gi, "")
      .replace(/\s+style='[^']*'/gi, "")
      .replace(/\s+(color|face|size|class|id|dir|lang)="[^"]*"/gi, "")
      .replace(/<font\b[^>]*>([\s\S]*?)<\/font>/gi, "$1");
  }

  const doc = new DOMParser().parseFromString(html, "text/html");

  // Attributes to preserve per tag
  const KEEP: Record<string, string[]> = {
    A: ["href", "target"],
    IMG: ["src", "alt", "width", "height"],
  };

  // 1. Strip all attributes, then restore whitelisted ones
  doc.querySelectorAll("*").forEach((el) => {
    const allowed = KEEP[el.tagName] ?? [];
    const saved: Record<string, string> = {};
    allowed.forEach((a) => {
      const v = el.getAttribute(a);
      if (v) saved[a] = v;
    });
    while (el.attributes.length > 0) el.removeAttribute(el.attributes[0].name);
    Object.entries(saved).forEach(([a, v]) => el.setAttribute(a, v));
  });

  // 2. Unwrap <font> tags — keep inner content
  doc.querySelectorAll("font").forEach((el) =>
    el.replaceWith(...Array.from(el.childNodes))
  );

  // 3. Remove empty inline wrappers (no text, no meaningful children)
  doc.querySelectorAll("span, b, i, u, em, strong").forEach((el) => {
    if (!el.textContent?.trim() && !el.querySelector("img, br")) el.remove();
  });

  // 4. Unwrap bare <span> elements that wrap only text (no nested tags)
  doc.querySelectorAll("span").forEach((el) => {
    if (el.children.length === 0) el.replaceWith(...Array.from(el.childNodes));
  });

  // 5. Remove <meta>, <script>, <style> tags entirely
  doc.querySelectorAll("meta, script, style").forEach((el) => el.remove());

  return doc.body.innerHTML;
}
