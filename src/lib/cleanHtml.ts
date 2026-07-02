/**
 * Strip all inline styles, forbidden attributes, font tags, and empty inline
 * wrappers from HTML produced by contentEditable / paste.
 *
 * serverCleanHtml  — regex-based, safe in Node/Edge (no DOM)
 * cleanHtml        — DOMParser-based on client, falls back to server version on SSR
 */

export function serverCleanHtml(html: string): string {
  if (!html) return "";
  return html
    // remove style attribute on any tag
    .replace(/\s+style\s*=\s*"[^"]*"/gi, "")
    .replace(/\s+style\s*=\s*'[^']*'/gi, "")
    // remove common dirty attributes
    .replace(/\s+(color|face|size|class|id|dir|lang|bgcolor|align|valign|width|height|border|cellpadding|cellspacing)\s*=\s*"[^"]*"/gi, "")
    .replace(/\s+(color|face|size|class|id|dir|lang|bgcolor|align|valign|width|height|border|cellpadding|cellspacing)\s*=\s*'[^']*'/gi, "")
    // unwrap <font> tags — keep content
    .replace(/<font\b[^>]*>([\s\S]*?)<\/font>/gi, "$1")
    // remove <meta>, <script>, <style> blocks entirely
    .replace(/<(meta|script|style)\b[^>]*\/>/gi, "")
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    // remove empty <span> tags
    .replace(/<span[^>]*>\s*<\/span>/gi, "")
    // collapse 3+ consecutive <br> into 2
    .replace(/(<br\s*\/?>\s*){3,}/gi, "<br><br>");
}

export function cleanHtml(html: string): string {
  if (!html) return "";
  if (typeof window === "undefined") return serverCleanHtml(html);

  const doc = new DOMParser().parseFromString(html, "text/html");

  // Attributes to preserve per tag
  const KEEP: Record<string, string[]> = {
    A: ["href", "target"],
    IMG: ["src", "alt", "width", "height"],
  };

  // Strip all attributes, restore only whitelisted
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

  // Unwrap <font> tags
  doc.querySelectorAll("font").forEach((el) =>
    el.replaceWith(...Array.from(el.childNodes))
  );

  // Remove empty inline wrappers
  doc.querySelectorAll("span, b, i, u, em, strong").forEach((el) => {
    if (!el.textContent?.trim() && !el.querySelector("img, br")) el.remove();
  });

  // Unwrap bare <span>s wrapping only text
  doc.querySelectorAll("span").forEach((el) => {
    if (el.children.length === 0) el.replaceWith(...Array.from(el.childNodes));
  });

  // Remove meta/script/style
  doc.querySelectorAll("meta, script, style").forEach((el) => el.remove());

  return doc.body.innerHTML;
}
