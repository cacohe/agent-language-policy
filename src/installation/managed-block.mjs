/** Safely create, inspect, update, and remove the tool-owned instruction block. */
const START = '<!-- agent-language-policy:start -->';
const END = '<!-- agent-language-policy:end -->';

function occurrences(text, marker) {
  return text.split(marker).length - 1;
}

function eolFor(text) {
  return text.includes('\r\n') ? '\r\n' : '\n';
}

function rangeFor(text) {
  const startCount = occurrences(text, START);
  const endCount = occurrences(text, END);

  if (startCount === 0 && endCount === 0) return undefined;
  if (startCount !== 1 || endCount !== 1) return null;

  const start = text.indexOf(START);
  const end = text.indexOf(END);
  if (end < start) return null;
  return { start, end: end + END.length };
}

export function inspectManagedBlock(text) {
  const range = rangeFor(text);
  if (range === undefined) return { status: 'absent' };
  if (range === null) return { status: 'malformed' };
  return { status: 'present', range };
}

function formatBlock(content, eol) {
  const normalized = content.replaceAll('\r\n', '\n').replaceAll('\r', '\n').trim();
  return `${START}${eol}${normalized.replaceAll('\n', eol)}${eol}${END}`;
}

export function upsertManagedBlock(text, content) {
  const inspection = inspectManagedBlock(text);
  if (inspection.status === 'malformed') {
    throw new Error('Malformed managed block: expected exactly one ordered start/end pair');
  }

  const eol = eolFor(text);
  const block = formatBlock(content, eol);
  if (inspection.status === 'present') {
    const { start, end } = inspection.range;
    return `${text.slice(0, start)}${block}${text.slice(end)}`;
  }

  if (!text) return `${block}${eol}`;
  const separator = text.endsWith(`${eol}${eol}`) ? '' : text.endsWith(eol) ? eol : `${eol}${eol}`;
  return `${text}${separator}${block}${eol}`;
}

export function removeManagedBlock(text) {
  const inspection = inspectManagedBlock(text);
  if (inspection.status === 'absent') return text;
  if (inspection.status === 'malformed') {
    throw new Error('Malformed managed block: expected exactly one ordered start/end pair');
  }

  const eol = eolFor(text);
  const { start } = inspection.range;
  let { end } = inspection.range;
  if (text.slice(end).startsWith(eol)) end += eol.length;
  let result = `${text.slice(0, start)}${text.slice(end)}`;
  const trailingDouble = new RegExp(`${eol === '\r\n' ? '\\r\\n' : '\\n'}{2}$`);
  result = result.replace(trailingDouble, eol);
  return result;
}

export const MANAGED_BLOCK_MARKERS = Object.freeze({ start: START, end: END });
