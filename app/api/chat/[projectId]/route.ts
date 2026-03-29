/**
 * app/api/chat/[projectId]/route.ts
 *
 * Next.js App Router API route that handles AI chat/generation streaming.
 * Moved here from the Cloudflare Worker to avoid CPU time limits on the free plan.
 * Vercel functions support up to 60s execution time on the free tier.
 *
 * This route:
 * 1. Verifies the Clerk JWT
 * 2. Fetches project + files from the Cloudflare Worker
 * 3. Streams AI response using the Vercel AI SDK
 * 4. Saves the new version + chat history back via the Cloudflare Worker
 */

import { NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { streamText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createDeepSeek } from "@ai-sdk/deepseek";
import type { LanguageModel } from "ai";
import {
  buildSystemPrompt,
  prepareChatHistory,
} from "@/lib/chat/system-prompt";
import {
  parseFilesFromResponse,
  mergeFiles,
  extractExplanation,
} from "@/lib/chat/file-parser";
import { sanitizeChatMessage } from "@/lib/chat/sanitize";
import { MODEL_REGISTRY, DEFAULT_MODEL } from "@/lib/chat/model-registry";
import type { ProjectFile, Version, Project } from "@/types/project";
import type { ChatMessage, ChatSession, ImageAttachment } from "@/types/chat";

const WORKER_URL =
  process.env.WORKER_URL ?? process.env.NEXT_PUBLIC_WORKER_URL ?? "http://localhost:8787";

/** Max duration for Vercel serverless function (seconds) */
export const maxDuration = 60;

function getModel(modelId: string): LanguageModel {
  const config = MODEL_REGISTRY[modelId];
  if (!config) throw new Error(`Unknown model: ${modelId}`);

  switch (config.provider) {
    case "anthropic":
      return createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })(
        config.apiModelId
      );
    case "openai":
      return createOpenAI({ apiKey: process.env.OPENAI_API_KEY! })(
        config.apiModelId
      );
    case "google":
      return createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_AI_API_KEY!,
      })(config.apiModelId);
    case "deepseek":
      return createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY! })(
        config.apiModelId
      );
    case "openrouter":
      return createOpenAI({
        apiKey: process.env.OPENROUTER_API_KEY!,
        baseURL: "https://openrouter.ai/api/v1",
        compatibility: "compatible",
      }).chat(config.apiModelId);
    default:
      throw new Error(`Provider not implemented: ${config.provider}`);
  }
}

function workerFetch(path: string, token: string, options: RequestInit = {}) {
  return fetch(`${WORKER_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { getToken, userId } = getAuth(req);

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const token = await getToken();
  if (!token) {
    return new Response(JSON.stringify({ error: "No token" }), { status: 401 });
  }

  const body = await req.json<{
    message: string;
    model?: string;
    images?: ImageAttachment[];
  }>();

  const userMessage = sanitizeChatMessage(body.message || "");
  if (!userMessage) {
    return new Response(JSON.stringify({ error: "Message is required", code: "VALIDATION_ERROR" }), { status: 400 });
  }

  const modelId = body.model || DEFAULT_MODEL;
  const images = body.images || [];
  const modelConfig = MODEL_REGISTRY[modelId];

  if (!modelConfig) {
    return new Response(JSON.stringify({ error: `Unknown model: ${modelId}`, code: "INVALID_MODEL" }), { status: 400 });
  }

  // Check credits via worker
  const creditsRes = await workerFetch("/api/credits", token);
  if (!creditsRes.ok) {
    return new Response(JSON.stringify({ error: "Failed to check credits" }), { status: 500 });
  }
  const creditsData = await creditsRes.json() as {
    remaining: number;
    plan: "free" | "pro";
    isUnlimited: boolean;
  };

  if (modelConfig.tier === "premium" && creditsData.plan === "free") {
    return new Response(JSON.stringify({ error: "Premium models require a Pro plan.", code: "PREMIUM_MODEL_LOCKED" }), { status: 403 });
  }
  if (!creditsData.isUnlimited && creditsData.remaining < modelConfig.creditCost) {
    return new Response(JSON.stringify({ error: "Not enough credits.", code: "CREDITS_EXHAUSTED" }), { status: 402 });
  }

  // Fetch project from worker
  const projectRes = await workerFetch(`/api/projects/${projectId}`, token);
  if (!projectRes.ok) {
    return new Response(JSON.stringify({ error: "Project not found" }), { status: 404 });
  }
  const { project } = await projectRes.json() as { project: Project };

  // Fetch current files from worker
  const filesRes = await workerFetch(`/api/projects/${projectId}/files`, token);
  let existingFiles: ProjectFile[] = [];
  if (filesRes.ok) {
    const filesData = await filesRes.json() as { files: ProjectFile[] };
    existingFiles = filesData.files || [];
  }

  // Fetch chat history from worker
  const chatRes = await workerFetch(`/api/chat/${projectId}`, token);
  let chatHistory: ChatMessage[] = [];
  if (chatRes.ok) {
    const chatData = await chatRes.json() as { messages: ChatMessage[] };
    chatHistory = chatData.messages || [];
  }

  // Build prompt
  const systemPrompt = buildSystemPrompt(existingFiles);
  const rawMessages = chatHistory
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
  const trimmedHistory = prepareChatHistory(rawMessages);

  type MsgContent =
    | string
    | Array<{ type: "text"; text: string } | { type: "image"; image: string; mimeType: string }>;

  const sdkMessages: Array<{ role: "user" | "assistant"; content: MsgContent }> =
    trimmedHistory.map((m) => ({ role: m.role, content: m.content }));

  if (images.length > 0 && modelConfig.supportsVision) {
    sdkMessages.push({
      role: "user",
      content: [
        { type: "text", text: userMessage },
        ...images.map((img) => ({
          type: "image" as const,
          image: img.base64,
          mimeType: img.mediaType,
        })),
      ],
    });
  } else {
    sdkMessages.push({ role: "user", content: userMessage });
  }

  // Stream AI response as SSE
  const encoder = new TextEncoder();
  let eventId = 0;

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        const chunk = `id: ${eventId++}\nevent: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(chunk));
      }

      try {
        const model = getModel(modelId);
        const result = streamText({
          model,
          system: systemPrompt,
          messages: sdkMessages as Parameters<typeof streamText>[0]["messages"],
          maxTokens: modelConfig.maxOutputTokens,
        });

        let fullResponse = "";
        for await (const chunk of result.textStream) {
          fullResponse += chunk;
          send("chunk", { text: chunk });
        }

        // Parse files
        const parsedFiles = parseFilesFromResponse(fullResponse);
        const changedFilePaths = parsedFiles.map((f) => f.path);
        const mergedFiles = parsedFiles.length > 0
          ? mergeFiles(existingFiles, parsedFiles)
          : existingFiles;

        let newVersionNumber = project.currentVersion;

        // Save new version via worker if files changed
        if (parsedFiles.length > 0) {
          newVersionNumber = project.currentVersion + 1;
          const newVersion: Version = {
            versionNumber: newVersionNumber,
            prompt: userMessage,
            model: modelId,
            files: mergedFiles,
            changedFiles: changedFilePaths,
            type: "ai",
            createdAt: new Date().toISOString(),
            fileCount: mergedFiles.length,
          };

          await workerFetch(
            `/api/chat/${projectId}/version`,
            token,
            { method: "POST", body: JSON.stringify({ version: newVersion }) }
          );
        }

        // Deduct credits via worker
        await workerFetch("/api/credits/deduct", token, {
          method: "POST",
          body: JSON.stringify({ cost: modelConfig.creditCost }),
        });

        // Save chat history via worker
        const explanationText = extractExplanation(fullResponse);
        const newUserMessage: ChatMessage = {
          id: `msg-${Date.now()}-user`,
          role: "user",
          content: userMessage,
          timestamp: new Date().toISOString(),
          images: images.length > 0 ? images : undefined,
        };
        const newAssistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: "assistant",
          content: explanationText,
          timestamp: new Date().toISOString(),
          versionNumber: parsedFiles.length > 0 ? newVersionNumber : undefined,
          model: modelId,
          changedFiles: parsedFiles.length > 0 ? changedFilePaths : undefined,
        };

        await workerFetch(`/api/chat/${projectId}`, token, {
          method: "POST",
          body: JSON.stringify({
            messages: [...chatHistory, newUserMessage, newAssistantMessage],
          }),
        });

        if (parsedFiles.length > 0) {
          send("files", { files: mergedFiles });
        }

        send("done", {
          versionId: `v${newVersionNumber}`,
          model: modelId,
          changedFiles: changedFilePaths,
          creditsRemaining: creditsData.remaining - modelConfig.creditCost,
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        send("error", { message: "Failed to generate code. Please try again.", code: "GENERATION_FAILED", detail: msg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
