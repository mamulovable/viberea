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
      {/* Backdrop overlay with fade-in animation */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={() => setIsVisible(false)}
      />

      {/* Main popup container with scale-in animation */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-scale-in">
          {/* Header with gradient background */}
          <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-8 text-white">
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold">✨ New & Improved!</h2>
              <p className="text-sm text-white/90">
                Visit the latest version of Dreamera
              </p>
            </div>
          </div>

          {/* Content section */}
          <div className="p-6 space-y-4">
            <p className="text-gray-700 text-sm leading-relaxed">
              We've launched a more stable and feature-rich version with improved performance and a better user experience.
            </p>

            {/* Feature highlights */}
            <div className="space-y-2 text-sm text-gray-600">
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

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsVisible(false)}
                className="flex-1"
              >
                Later
              </Button>
              <Button
                onClick={() => {
                  window.open(
                    "https://dream-era-liart.vercel.app/",
                    "_blank"
                  );
                  setIsVisible(false);
                }}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                Visit Now →
              </Button>
            </div>
          </div>

          {/* Footer note */}
          <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500 text-center border-t">
            Your projects will be seamlessly transferred
          </div>
        </div>
      </div>
    </>
  );
}
