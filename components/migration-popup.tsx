"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MigrationPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show popup after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop overlay with fade-in animation — matches dark theme */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
      />

      {/* Main popup container with scale-in animation */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="w-full max-w-md rounded-2xl bg-card shadow-2xl overflow-hidden animate-scale-in border border-border">
          {/* Header with dark theme styling */}
          <div className="relative bg-card p-8 text-card-foreground border-b border-border">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">✨ New & Improved!</h2>
              <p className="text-sm text-muted-foreground">
                Visit the latest version of Dreamera
              </p>
            </div>
          </div>

          {/* Content section */}
          <div className="p-6 space-y-4">
            <p className="text-foreground text-sm leading-relaxed">
              We've launched a more stable and feature-rich version with improved performance and a better user experience.
            </p>

            {/* Feature highlights */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Faster generation speeds</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Enhanced stability</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>New features & improvements</span>
              </div>
            </div>

            {/* Action button — Full width, no cancel */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  window.open(
                    "https://dream-era-liart.vercel.app/",
                    "_blank"
                  );
                }}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Visit the New Version →
              </Button>
            </div>
          </div>

          {/* Footer note */}
          <div className="bg-secondary px-6 py-3 text-xs text-muted-foreground text-center border-t border-border">
            Your projects will be seamlessly transferred
          </div>
        </div>
      </div>
    </>
  );
}
