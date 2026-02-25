export type FaqItem = {
  question: string;
  answerHtml: string;
};

const escapeHtml = (input: string) =>
  input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const renderInline = (input: string) => {
  const escaped = escapeHtml(input);
  return escaped
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
};

const renderBlocks = (markdown: string) => {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n');
  const parts: string[] = [];
  let i = 0;

  while (i < lines.length) {
    while (i < lines.length && lines[i].trim() === '') i++;
    if (i >= lines.length) break;

    const isListItem = (line: string) => /^(-|\*|•)\s+/.test(line.trim());

    if (isListItem(lines[i])) {
      const items: string[] = [];
      while (i < lines.length && isListItem(lines[i])) {
        const text = lines[i].trim().replace(/^(-|\*|•)\s+/, '');
        items.push(`<li>${renderInline(text)}</li>`);
        i++;
      }
      if (items.length) parts.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !isListItem(lines[i])) {
      para.push(lines[i].trim());
      i++;
    }
    if (para.length) parts.push(`<p>${renderInline(para.join(' '))}</p>`);
  }

  return parts.join('');
};

export function parseFaqMarkdown(markdown: string): FaqItem[] {
  const out: FaqItem[] = [];
  const re = /^###\s+([^\n]+)\n([\s\S]*?)(?=\n###\s+|$)/gm;
  let match: RegExpExecArray | null;

  while ((match = re.exec(markdown)) !== null) {
    const question = (match[1] ?? '').trim();
    const rawAnswer = (match[2] ?? '').trim();
    const answerHtml = renderBlocks(rawAnswer);

    if (!question || !answerHtml) continue;
    out.push({ question, answerHtml });
  }

  return out;
}
