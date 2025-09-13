export function normalizeToMarkdown(raw) {
  if (raw == null) return "";
  // Convert common HTML line breaks to \n
  let s = String(raw)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>|<\/div>/gi, "\n")
    .replace(/<p[^>]*>|<div[^>]*>/gi, "");
  
  // Preserve font styling spans but clean up other tags
  // Keep spans with style attributes for font size and color
  s = s.replace(/<(?!span\s+style=|\/span)([^>]+)>/g, "");
  
  s = s.replace(/\r\n/g, "\n");
  return s;
}
