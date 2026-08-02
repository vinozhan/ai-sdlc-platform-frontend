import { useState } from "react";
import {
  ArrowUp,
  Bot,
  FileText,
  Mic,
  Paperclip,
  Plus,
  Sparkles,
  Upload,
} from "lucide-react";
import type { Project } from "@/types/project";
import { projectsApi } from "@/entities/project";
import { useUiStore } from "@/store/ui";
import { cn } from "@/shared/utils/cn";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitives";

export function RequirementsChat({
  project,
  isDark,
}: {
  project: Project;
  isDark: boolean;
}) {
  const addToast = useUiStore((s) => s.addToast);
  const [showSourceHistory, setShowSourceHistory] = useState(false);
  const [followUpText, setFollowUpText] = useState("");

  const sourceMessages =
    project.requirementChat && project.requirementChat.length > 0
      ? project.requirementChat
      : project.requirementText.trim()
        ? [
            {
              id: "fallback_source_message",
              role: "user" as const,
              type: "source_requirement" as const,
              content: project.requirementText,
              createdAt: project.updatedAt,
            },
          ]
        : [];

  const sendFollowUpRequirement = () => {
    const next = followUpText.trim();
    if (!next) return;
    void projectsApi.appendRequirementChatMessage(project.id, {
      role: "user",
      type: "source_requirement",
      content: next,
    });
    void projectsApi.appendRequirementChatMessage(project.id, {
      role: "assistant",
      type: "chat",
      content: "Follow-up requirement captured and added to source history.",
    });
    setFollowUpText("");
    addToast({
      type: "info",
      title: "Requirement added",
      message: "Follow-up requirement saved in source chat history",
    });
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className={cn("text-xs font-semibold uppercase tracking-wide", isDark ? "text-slate-500" : "text-slate-400")}>
              Source requirements
            </p>
            <button
              type="button"
              onClick={() => setShowSourceHistory((prev) => !prev)}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
                isDark
                  ? "border-blue-500/25 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"
                  : "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
              )}
              title={showSourceHistory ? "Hide source chat history" : "Show source chat history"}
            >
              <Bot className="h-4 w-4" />
            </button>
          </div>

          {!showSourceHistory && (
            <>
              <p className={cn("text-sm leading-relaxed", isDark ? "text-slate-300" : "text-slate-700")}>
                {project.requirementText}
              </p>
              {project.files.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.files.map((f) => (
                    <Badge key={f} variant="default">
                      <Upload className="h-3 w-3" />
                      {f}
                    </Badge>
                  ))}
                </div>
              )}
            </>
          )}

          {showSourceHistory && (
            <div className={cn("space-y-3 rounded-xl border p-3", isDark ? "border-white/10 bg-[#0b1728]" : "border-[#d8e7db] bg-[#e9f7ec]")}>
              <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1">
                {sourceMessages.length === 0 && (
                  <p className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>
                    No source history yet.
                  </p>
                )}
                {sourceMessages.map((msg) => {
                  const isAssistant = msg.role === "assistant";
                  return (
                    <div key={msg.id} className={cn("flex", isAssistant ? "justify-start" : "justify-end")}>
                      <div className="max-w-[92%]">
                        <div
                          className={cn(
                            "rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm",
                            isAssistant
                              ? isDark
                                ? "bg-[#0f1d32] text-slate-200"
                                : "bg-white text-slate-700"
                              : isDark
                                ? "bg-[#1f2937] text-slate-100"
                                : "bg-[#dcf8c6] text-slate-800"
                          )}
                        >
                          {msg.type === "source_requirement" && (
                            <p
                              className={cn(
                                "mb-1 text-[10px] font-semibold uppercase tracking-wide",
                                isDark ? "text-slate-400" : "text-slate-500"
                              )}
                            >
                              Source
                            </p>
                          )}
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <p className={cn("mt-1 px-1 text-right text-[10px]", isDark ? "text-slate-500" : "text-slate-500")}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                className={cn(
                  "rounded-2xl border p-3",
                  isDark ? "border-white/10 bg-[#081321]" : "border-slate-200 bg-white shadow-sm"
                )}
              >
                <textarea
                  value={followUpText}
                  onChange={(e) => setFollowUpText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendFollowUpRequirement();
                    }
                  }}
                  rows={2}
                  placeholder="Describe a product, paste requirements, or outline a system to build..."
                  className={cn(
                    "mb-3 w-full resize-none bg-transparent px-1 py-1 text-[16px] outline-none placeholder:text-slate-400",
                    isDark ? "text-slate-100" : "text-slate-700"
                  )}
                />

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                        isDark ? "text-slate-400 hover:bg-white/5" : "text-slate-500 hover:bg-slate-100"
                      )}
                      title="More actions"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                        isDark ? "text-slate-400 hover:bg-white/5" : "text-slate-500 hover:bg-slate-100"
                      )}
                      title="Attach file"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={cn(
                        "inline-flex h-8 items-center gap-1 rounded-full px-3 text-xs font-medium",
                        isDark ? "bg-white/10 text-slate-200" : "bg-slate-100 text-slate-700"
                      )}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Plan
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                        isDark ? "text-slate-400 hover:bg-white/5" : "text-slate-500 hover:bg-slate-100"
                      )}
                      title="Voice input"
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={sendFollowUpRequirement}
                      disabled={!followUpText.trim()}
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white transition-colors disabled:opacity-50",
                        isDark ? "bg-slate-600 hover:bg-slate-500" : "bg-blue-500 hover:bg-blue-400"
                      )}
                      title="Send requirement"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-400" />
            Parsed Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className={cn("text-sm", isDark ? "text-slate-300" : "text-slate-600")}>
            Requirements document parsed successfully. Identified scope, actors, and core entities from your input.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: "Sections parsed", value: "12" },
              { label: "Requirements found", value: "28" },
              { label: "Confidence", value: "96%" },
            ].map((s) => (
              <div key={s.label} className={cn("rounded-lg border p-3", isDark ? "border-white/10" : "border-slate-200")}>
                <p className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>{s.label}</p>
                <p className={cn("mt-1 text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>{s.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
