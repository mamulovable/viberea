/**
 * lib/chat/model-registry.ts
 * Shared model registry used by the Next.js chat API route.
 * Mirrors worker/src/ai/providers/index.ts MODEL_REGISTRY.
 */

export interface ModelConfig {
  provider: "anthropic" | "openai" | "google" | "deepseek" | "openrouter";
  displayName: string;
  apiModelId: string;
  creditCost: number;
  tier: "fast" | "premium";
  speed: "very-fast" | "fast" | "medium";
  quality: "good" | "high";
  description: string;
  supportsVision: boolean;
  maxOutputTokens: number;
}

export const MODEL_REGISTRY: Record<string, ModelConfig> = {
  "claude-sonnet-4-5": {
    provider: "anthropic",
    displayName: "Claude Sonnet 4.5",
    apiModelId: "claude-sonnet-4-5-20250929",
    creditCost: 2,
    tier: "premium",
    speed: "medium",
    quality: "high",
    description: "Best code quality. Ideal for complex features and architecture.",
    supportsVision: true,
    maxOutputTokens: 16384,
  },
  "claude-haiku-3-5": {
    provider: "anthropic",
    displayName: "Claude Haiku 3.5",
    apiModelId: "claude-haiku-4-5-20251001",
    creditCost: 1,
    tier: "fast",
    speed: "fast",
    quality: "good",
    description: "Fast and capable. Great for quick iterations and simple changes.",
    supportsVision: true,
    maxOutputTokens: 16384,
  },
  "gpt-4o": {
    provider: "openai",
    displayName: "GPT-4o",
    apiModelId: "gpt-4o",
    creditCost: 2,
    tier: "premium",
    speed: "medium",
    quality: "high",
    description: "Versatile and reliable. Excellent for full-stack features.",
    supportsVision: true,
    maxOutputTokens: 16384,
  },
  "gpt-4o-mini": {
    provider: "openai",
    displayName: "GPT-4o Mini",
    apiModelId: "gpt-4o-mini",
    creditCost: 1,
    tier: "fast",
    speed: "fast",
    quality: "good",
    description: "Blazing fast and affordable. Perfect for small tweaks.",
    supportsVision: true,
    maxOutputTokens: 16384,
  },
  "gemini-2-flash": {
    provider: "google",
    displayName: "Gemini 2.0 Flash",
    apiModelId: "gemini-2.0-flash",
    creditCost: 1,
    tier: "fast",
    speed: "very-fast",
    quality: "good",
    description: "Fastest model available. Ideal for rapid prototyping.",
    supportsVision: true,
    maxOutputTokens: 16384,
  },
  "gemini-2-pro": {
    provider: "google",
    displayName: "Gemini 2.0 Pro",
    apiModelId: "gemini-2.0-pro",
    creditCost: 2,
    tier: "premium",
    speed: "medium",
    quality: "high",
    description: "High quality with massive context. Great for large projects.",
    supportsVision: true,
    maxOutputTokens: 16384,
  },
  "deepseek-v3": {
    provider: "deepseek",
    displayName: "DeepSeek V3",
    apiModelId: "deepseek-chat",
    creditCost: 1,
    tier: "fast",
    speed: "fast",
    quality: "good",
    description: "Cost-effective and capable. Great for everyday coding tasks.",
    supportsVision: false,
    maxOutputTokens: 8192,
  },
  "deepseek-r1": {
    provider: "deepseek",
    displayName: "DeepSeek R1",
    apiModelId: "deepseek-reasoner",
    creditCost: 1,
    tier: "fast",
    speed: "medium",
    quality: "high",
    description: "Reasoning model. Excellent for complex logic and debugging.",
    supportsVision: false,
    maxOutputTokens: 16384,
  },
  "glm-5": {
    provider: "openrouter",
    displayName: "GLM-5",
    apiModelId: "z-ai/glm-5",
    creditCost: 1,
    tier: "fast",
    speed: "fast",
    quality: "good",
    description: "ZhipuAI's GLM-5 via OpenRouter. Strong multilingual and coding capabilities.",
    supportsVision: false,
    maxOutputTokens: 8192,
  },
};

export const DEFAULT_MODEL = "gpt-4o-mini";
