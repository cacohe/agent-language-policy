function stripInlineSyntax(line) {
  return line
    .replace(/<!--.*?-->/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`[^`]*`/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/^\s{0,3}#{1,6}\s+/, '')
    .replace(/^\s*(?:[-*+] |\d+[.)] |> )/, '')
    .replace(/^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/, '')
    .replace(/[|]/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractHumanProse(markdown) {
  const lines = markdown.replaceAll('\r\n', '\n').replaceAll('\r', '\n').split('\n');
  const prose = [];
  let fence;
  let inComment = false;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    const fenceMatch = trimmed.match(/^(`{3,}|~{3,})/);
    if (fenceMatch) {
      if (!fence) fence = fenceMatch[1][0];
      else if (fence === fenceMatch[1][0]) fence = undefined;
      continue;
    }
    if (fence) continue;

    if (trimmed.includes('<!--')) inComment = true;
    if (inComment) {
      if (trimmed.includes('-->')) inComment = false;
      continue;
    }

    const cleaned = stripInlineSyntax(rawLine);
    if (cleaned) prose.push(cleaned);
  }

  return prose.join('\n');
}

