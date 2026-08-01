type Lang = "typescript" | "tsx" | "java" | "css" | "json" | "yaml" | "dockerfile";

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

function highlightJavaLine(line: string, t: typeof themes.dark): string {
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

const dockerInstructions = new Set([
  "FROM", "RUN", "CMD", "LABEL", "EXPOSE", "ENV", "ADD", "COPY", "ENTRYPOINT", "VOLUME",
  "USER", "WORKDIR", "ARG", "ONBUILD", "STOPSIGNAL", "HEALTHCHECK", "SHELL", "AS",
]);

/** Escape the plain runs and colour the double quoted ones. */
function withStrings(text: string, t: typeof themes.dark) {
  let out = "";
  let rest = text;
  for (;;) {
    const open = rest.indexOf('"');
    if (open === -1) return out + escapeHtml(rest);
    const close = rest.indexOf('"', open + 1);
    if (close === -1) return out + escapeHtml(rest);
    out += escapeHtml(rest.slice(0, open)) + span(t.string, rest.slice(open, close + 1));
    rest = rest.slice(close + 1);
  }
}

function highlightYamlValue(text: string, t: typeof themes.dark) {
  const value = text.trim();
  if (!value) return escapeHtml(text);
  const lead = text.slice(0, text.length - text.trimStart().length);
  if (/^-?\d+(\.\d+)?$/.test(value)) return escapeHtml(lead) + span(t.number, value);
  if (/^(true|false|null|~)$/.test(value)) return escapeHtml(lead) + span(t.keyword, value);
  return escapeHtml(lead) + span(t.string, value);
}

function highlightYamlLine(line: string, t: typeof themes.dark) {
  if (/^\s*#/.test(line)) return span(t.comment, line);

  const hash = line.search(/\s#/);
  const body = hash === -1 ? line : line.slice(0, hash);
  const trailing = hash === -1 ? "" : line.slice(hash);

  const key = body.match(/^(\s*(?:-\s*)?)([\w.$/-]+)(:)(.*)$/);
  const marked = key
    ? escapeHtml(key[1]) + span(t.function, key[2]) + span(t.punctuation, key[3]) + highlightYamlValue(key[4], t)
    : highlightYamlValue(body, t);

  return marked + (trailing ? span(t.comment, trailing) : "");
}

function highlightDockerLine(line: string, t: typeof themes.dark) {
  if (/^\s*#/.test(line)) return span(t.comment, line);

  const head = line.match(/^(\s*)([A-Z]+)\b/);
  if (head && dockerInstructions.has(head[2])) {
    const rest = line.slice(head[1].length + head[2].length);
    return escapeHtml(head[1]) + span(t.keyword, head[2]) + withStrings(rest, t);
  }
  return withStrings(line, t);
}

export function highlightCode(code: string, language: Lang, isDark: boolean) {
  const t = isDark ? themes.dark : themes.light;
  const lines = code.split("\n");

  return lines.map((line) => {
    if (language === "java") return highlightJavaLine(line, t);
    if (language === "css") return highlightCssLine(line, t);
    if (language === "yaml") return highlightYamlLine(line, t);
    if (language === "dockerfile") return highlightDockerLine(line, t);
    return highlightTsLine(line, t);
  });
}

export function languageFromPath(path: string): Lang {
  if (path.endsWith(".tsx")) return "tsx";
  if (path.endsWith(".ts")) return "typescript";
  if (path.endsWith(".java")) return "java";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".yaml") || path.endsWith(".yml")) return "yaml";
  if (path.endsWith("Dockerfile")) return "dockerfile";
  return "typescript";
}
