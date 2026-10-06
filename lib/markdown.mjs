function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>\"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[character]);
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function safeUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

function inlineMarkdown(value, references) {
  const source = String(value || "");
  const token = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\[([^\]]+)\]|`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\n]+)\*|_([^_\n]+)_)/g;
  let html = "";
  let cursor = 0;
  let match;
  while ((match = token.exec(source))) {
    html += escapeHtml(source.slice(cursor, match.index));
    if (match[2] && match[3]) {
      const url = safeUrl(match[3]);
      html += url ? `<a href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(match[2])}</a>` : escapeHtml(match[0]);
    } else if (match[4]) {
      const url = references.get(match[4].toLowerCase());
      html += url ? `<a href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(match[4])}</a>` : escapeHtml(match[0]);
    } else if (match[5]) {
      html += `<code>${escapeHtml(match[5])}</code>`;
    } else if (match[6] || match[7]) {
      html += `<strong>${escapeHtml(match[6] || match[7])}</strong>`;
    } else {
      html += `<em>${escapeHtml(match[8] || match[9])}</em>`;
    }
    cursor = token.lastIndex;
  }
  return html + escapeHtml(source.slice(cursor));
}

function markdownHtml(markdown) {
  const references = new Map();
  const lines = String(markdown || "").replace(/\r/g, "").split("\n").filter((rawLine) => {
    const reference = rawLine.trim().match(/^\[([^\]]+)\]:\s*(https?:\/\/\S+)\s*$/);
    if (!reference) return true;
    const url = safeUrl(reference[2]);
    if (url) references.set(reference[1].toLowerCase(), url);
    return false;
  });
  const output = [];
  let paragraph = [];
  let list = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    output.push(`<p>${inlineMarkdown(paragraph.join(" "), references)}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list) return;
    output.push(`<${list.tag}>${list.items.map((item) => `<li>${inlineMarkdown(item, references)}</li>`).join("")}</${list.tag}>`);
    list = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    const bullet = line.match(/^[-*]\s+(.+)$/);
    const numbered = line.match(/^\d+\.\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      output.push(`<${heading[1].length <= 2 ? "h2" : "h3"}>${inlineMarkdown(heading[2], references)}</${heading[1].length <= 2 ? "h2" : "h3"}>`);
    } else if (bullet || numbered) {
      flushParagraph();
      const tag = numbered ? "ol" : "ul";
      if (!list || list.tag !== tag) {
        flushList();
        list = { tag, items: [] };
      }
      list.items.push((bullet || numbered)[1]);
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  return output.join("\n");
}


export {escapeHtml, escapeAttribute, safeUrl, markdownHtml};
