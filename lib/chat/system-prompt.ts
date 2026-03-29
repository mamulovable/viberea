import type { ProjectFile } from "@/types/project";

// Re-export from worker source — same logic, no CF-specific deps
export { buildSystemPrompt, prepareChatHistory } from "../../worker/src/ai/system-prompt";
