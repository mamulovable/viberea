import type { ProjectFile } from "@/types/project";

const FILE_TAG_REGEX = /<file\s+path="([^"]+)">\n?([\s\S]*?)\n?<\/file>/g;

function stripMarkdownFences(content: string): string {
  const lines = content.split("\n");
  if (lines.length > 0 && /^\s*```[a-zA-Z]*\s*$/.test(lines[0])) lines.shift();
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();
  if (lines.length > 0 && /^\s*```\s*$/.test(lines[lines.length - 1])) lines.pop();
  return lines.join("\n");
}

function isValidFilePath(filePath: string): boolean {
  if (!filePath || filePath.length === 0) return false;
  if (filePath.startsWith("/")) return false;
  if (filePath.includes("..")) return false;
  if (filePath.includes("\\")) return false;
  if (filePath.length > 256) return false;
  return true;
}

export function parseFilesFromResponse(response: string): ProjectFile[] {
  const files: ProjectFile[] = [];
  FILE_TAG_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = FILE_TAG_REGEX.exec(response)) !== null) {
    const path = match[1].trim();
    const content = stripMarkdownFences(match[2]);
    if (isValidFilePath(path)) files.push({ path, content });
  }
  return files;
}

export function mergeFiles(existingFiles: ProjectFile[], newFiles: ProjectFile[]): ProjectFile[] {
  const fileMap = new Map<string, ProjectFile>();
  for (const file of existingFiles) fileMap.set(file.path, file);
  for (const file of newFiles) fileMap.set(file.path, file);
  return Array.from(fileMap.values()).sort((a, b) => a.path.localeCompare(b.path));
}

export function extractExplanation(response: string): string {
  return response.replace(FILE_TAG_REGEX, "").replace(/\n{3,}/g, "\n\n").trim();
}
