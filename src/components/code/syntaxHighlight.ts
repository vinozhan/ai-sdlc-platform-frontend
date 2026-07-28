type Lang = "typescript" | "tsx" | "java" | "css";

const themes = {
  dark: {
    keyword: "#569cd6",
    string: "#ce9178",
    comment: "#6a9955",
    type: "#4ec9b0",
    number: "#b5cea8",
    annotation: "#dcdcaa",
    function: "#dcdcaa",
    default: "#d4d4d4",
    punctuation: "#808080",
  },
  light: {
    keyword: "#0000ff",
    string: "#a31515",
    comment: "#008000",
    type: "#267f99",
    number: "#098658",
    annotation: "#795e26",
    function: "#795e26",
    default: "#24292e",
    punctuation: "#393a34",
  },
};

const tsKeywords = new Set([
  "import", "export", "from", "const", "let", "var", "function", "return", "if", "else",
  "async", "await", "interface", "type", "extends", "implements", "new", "class", "public",
  "private", "protected", "static", "void", "null", "undefined", "true", "false", "as",
]);

const javaKeywords = new Set([
  "import", "package", "public", "private", "protected", "class", "interface", "extends",
  "implements", "return", "if", "else", "new", "final", "static", "void", "null", "true",
  "false", "this", "throw", "throws", "enum", "var",
]);

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function span(color: string, text: string) {
  return `<span style="color:${color}">${escapeHtml(text)}</span>`;
}

function highlightTsLine(line: string, t: typeof themes.dark) {
  if (/^\s*\/\//.test(line) || /^\s*\/\*/.test(line)) {
    return span(t.comment, line);
  }

  let result = "";
  let i = 0;
  while (i < line.length) {
    const rest = line.slice(i);

    if (/^["'`]/.test(rest)) {
      const quote = rest[0];
      const end = rest.indexOf(quote, 1);
      const token = end === -1 ? rest : rest.slice(0, end + 1);
      result += span(t.string, token);
      i += token.length;
      continue;
    }

    const word = rest.match(/^[A-Za-z_$][\w$]*/);
    if (word) {
      const w = word[0];
      if (tsKeywords.has(w)) result += span(t.keyword, w);
      else if (/^[A-Z]/.test(w)) result += span(t.type, w);
      else if (rest[w.length] === "(") result += span(t.function, w);
      else result += span(t.default, w);
      i += w.length;
      continue;
    }

    if (/^\d+/.test(rest)) {
      const num = rest.match(/^\d+/)![0];
      result += span(t.number, num);
      i += num.length;
      continue;
    }

    result += span(t.punctuation, rest[0]);
    i += 1;
  }

  return result;
}

function highlightJavaLine(line: string, t: typeof themes.dark) {
  if (/^\s*\/\//.test(line)) return span(t.comment, line);
  if (/^\s*@/.test(line)) {
    const match = line.match(/^(\s*@\w+)/);
    if (match) {
      return span(t.annotation, match[1]) + highlightJavaLine(line.slice(match[1].length), t);
    }
  }

  let result = "";
  let i = 0;
  while (i < line.length) {
    const rest = line.slice(i);
    if (/^["']/.test(rest)) {
      const quote = rest[0];
      const end = rest.indexOf(quote, 1);
      const token = end === -1 ? rest : rest.slice(0, end + 1);
      result += span(t.string, token);
      i += token.length;
      continue;
    }

    const word = rest.match(/^[A-Za-z_$][\w$]*/);
    if (word) {
      const w = word[0];
      if (javaKeywords.has(w)) result += span(t.keyword, w);
      else if (/^[A-Z]/.test(w)) result += span(t.type, w);
      else result += span(t.default, w);
      i += w.length;
      continue;
    }

    result += span(t.punctuation, rest[0] ?? "");
    i += 1;
  }

  return result;
}

function highlightCssLine(line: string, t: typeof themes.dark) {
  if (/^\s*\/\*/.test(line)) return span(t.comment, line);
  return line.replace(/([.#][\w-]+)/g, (_, sel) => span(t.type, sel))
    .replace(/([\w-]+)(?=\s*:)/g, (m) => span(t.function, m))
    .replace(/:\s*([^;]+);/g, (_, val) => `: ${span(t.string, val.trim())};`);
}

export function highlightCode(code: string, language: Lang, isDark: boolean) {
  const t = isDark ? themes.dark : themes.light;
  const lines = code.split("\n");

  return lines.map((line) => {
    if (language === "java") return highlightJavaLine(line, t);
    if (language === "css") return highlightCssLine(line, t);
    return highlightTsLine(line, t);
  });
}

export function languageFromPath(path: string): Lang {
  if (path.endsWith(".tsx")) return "tsx";
  if (path.endsWith(".ts")) return "typescript";
  if (path.endsWith(".java")) return "java";
  if (path.endsWith(".css")) return "css";
  return "typescript";
}
