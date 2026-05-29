"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Plus, Mic, ArrowUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type SuggestionKey = "Reporting Dashboard" | "Gaming Platform" | "Onboarding Portal" | "Room Visualizer" | "Networking App";

const SAMPLE_PROMPTS: Record<SuggestionKey, string> = {
  "Reporting Dashboard": "A modern SaaS analytics dashboard with interactive revenue charts, a user management grid, status badges, dark mode toggle, and responsive sidebar navigation.",
  "Gaming Platform": "A retro-themed arcade hub featuring a fully playable classic Snake game, real-time score tracking, audio effect simulator, and neon glow aesthetics.",
  "Onboarding Portal": "An interactive employee onboarding portal with a multi-step checklist, progress indicator, profile setup form, document uploader, and celebratory confetti animation.",
  "Room Visualizer": "A creative 2D room planner with drag-and-drop furniture, interactive wall color picker, hardwood vs carpet toggle, and layout saving.",
  "Networking App": "A developer matching platform featuring interactive swipe cards, language-based match filters, clean profile layouts, and a direct message simulator."
};

export function Hero() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [planEnabled, setPlanEnabled] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<SuggestionKey | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Populates the text area with a premium sample prompt when a suggestion pill is clicked
  const handleSuggestionClick = (key: SuggestionKey) => {
    setPrompt(SAMPLE_PROMPTS[key]);
    setActiveSuggestion(key);
  };

  // Navigates to dashboard or sign-up, carrying the pre-filled prompt in the query string
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const targetBase = isSignedIn ? "/dashboard" : "/sign-up";
    const encodedPrompt = encodeURIComponent(prompt.trim());
    router.push(`${targetBase}?prompt=${encodedPrompt}`);
  };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-16">
      {/* Light Mesh Gradient Background inspired by user reference image */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Soft sky-blue to warm cream to soft peach transition */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#d5ebf8] via-[#faf8f5] to-[#fcead2]" />

        {/* Dynamic ambient glowing light blobs */}
        <div className="absolute -top-[10%] left-[10%] h-[60%] w-[60%] rounded-full bg-[#87ceeb] opacity-20 blur-[130px]" />
        <div className="absolute bottom-[5%] right-[5%] h-[50%] w-[55%] rounded-full bg-[#f4a460] opacity-15 blur-[130px]" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
        {/* Main Headline */}
        <h1 className="text-slate-900 font-bold tracking-tight text-5xl sm:text-6xl md:text-7xl leading-tight">
          Turn your ideas into apps
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-lg text-slate-600 max-w-xl font-medium leading-relaxed">
          Dreamera lets you build fully-functional apps in minutes with just your words. No coding necessary.
        </p>

        {/* Premium Interactive Input Card */}
        <form onSubmit={handleSubmit} className="mt-10 w-full max-w-2xl">
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.07)] hover:border-slate-300/80">
            {/* Input area */}
            <div className="w-full">
              <textarea
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setActiveSuggestion(null); // Clear suggestion highlight if custom edits are typed
                }}
                placeholder="Build me a..."
                className="w-full min-h-[90px] resize-none bg-transparent text-[16px] text-slate-800 placeholder-slate-400/80 focus:outline-none leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>

            {/* Bottom Actions Row */}
            <div className="mt-4 flex items-center justify-between">
              {/* Left actions: Attachment + Plan Toggle */}
              <div className="flex items-center gap-3 select-none">
                {/* Upload Button */}
                <button
                  type="button"
                  className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-slate-100 hover:text-slate-600"
                >
                  <Plus className="size-5" />
                </button>

                {/* Plan Toggle Container */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPlanEnabled(!planEnabled)}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/50 p-1 pr-3 transition-colors hover:border-slate-350 hover:bg-slate-50"
                  >
                    {/* Toggle pill */}
                    <div
                      className={cn(
                        "h-5 w-9 rounded-full transition-colors duration-200 p-0.5",
                        planEnabled ? "bg-[#f15a24]" : "bg-slate-300"
                      )}
                    >
                      <div
                        className={cn(
                          "h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                          planEnabled ? "translate-x-4" : "translate-x-0"
                        )}
                      />
                    </div>
                    <span className="text-[12px] font-semibold text-slate-600">Plan</span>
                  </button>

                  {/* Info Icon + Tooltip */}
                  <div className="relative">
                    <button
                      type="button"
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      onClick={() => setShowTooltip(!showTooltip)}
                      className="flex size-5 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Info className="size-3.5" />
                    </button>
                    {showTooltip && (
                      <div className="absolute bottom-8 left-1/2 z-50 w-64 -translate-x-1/2 rounded-xl bg-slate-900 p-3 text-left text-[11px] leading-relaxed text-slate-200 shadow-xl border border-slate-800">
                        When <strong className="text-white">Plan</strong> is enabled, Dreamera outlines a detailed step-by-step layout of modifications and designs for your approval before building, ensuring maximum precision.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right actions: Mic + Orange Submit button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-slate-100 hover:text-slate-600"
                >
                  <Mic className="size-5" />
                </button>

                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full text-white shadow-md transition-all duration-150 active:scale-95",
                    prompt.trim()
                      ? "bg-[#f15a24] hover:bg-[#d94814] hover:shadow-lg cursor-pointer"
                      : "bg-[#f15a24]/50 cursor-not-allowed"
                  )}
                >
                  <ArrowUp className="size-5 stroke-[2.5px]" />
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Suggestion Pills */}
        <div className="mt-8 select-none">
          <span className="text-[10px] font-bold tracking-wider text-slate-400/90 uppercase">
            Not sure where to start? Try one of these:
          </span>

          <div className="mt-4 flex flex-wrap justify-center gap-2 px-4 max-w-2xl">
            {(Object.keys(SAMPLE_PROMPTS) as SuggestionKey[]).map((key) => {
              const isSelected = activeSuggestion === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSuggestionClick(key)}
                  className={cn(
                    "px-4 py-2 text-xs font-semibold rounded-full border shadow-sm transition-all duration-200 active:scale-95 cursor-pointer",
                    isSelected
                      ? "bg-[#f15a24] text-white border-[#f15a24] scale-[1.03] shadow-md shadow-[#f15a24]/10"
                      : "bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-350 hover:shadow"
                  )}
                >
                  {key}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
