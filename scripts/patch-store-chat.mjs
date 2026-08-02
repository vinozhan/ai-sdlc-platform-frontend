import fs from "node:fs";

const path = "src/store/useStore.ts";
let s = fs.readFileSync(path, "utf8");

if (!s.includes("requirementChat: []")) {
  s = s.replace(
    /files: (\[[^\]]*\]),(\r?\n)(\s*)reqPhase:/g,
    "files: $1,$2$3requirementChat: [],$2$3reqPhase:",
  );
  s = s.replace(
    /requirementText: "",(\r?\n)(\s*)files: \[\],(\r?\n)(\s*)reqPhase: "input",/,
    'requirementText: "",$1$2files: [],$1$2requirementChat: [],$1$2reqPhase: "input",',
  );
}

if (!s.includes("appendRequirementChatMessage:")) {
  const action = `appendRequirementChatMessage: (projectId, message) =>
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const entry = {
              ...message,
              id: \`chat_\${Date.now().toString(36)}_\${Math.random().toString(36).slice(2, 7)}\`,
              createdAt: new Date().toISOString(),
            };
            const chat = [...(p.requirementChat ?? []), entry];
            const requirementText =
              message.type === "source_requirement" && message.role === "user"
                ? p.requirementText.trim()
                  ? \`\${p.requirementText.trim()}\\n\\n\${message.content}\`
                  : message.content
                : p.requirementText;
            return { ...p, requirementChat: chat, requirementText, updatedAt: entry.createdAt };
          }),
        })),

      `;
  s = s.replace(/(\s*)deleteProject: \(id\) =>/, `$1${action}deleteProject: (id) =>`);
}

fs.writeFileSync(path, s);
console.log({
  chatField: s.includes("requirementChat: []"),
  action: s.includes("appendRequirementChatMessage:"),
});
