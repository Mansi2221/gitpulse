"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import SearchBar from "@/app/components/SearchBar";
import type { PulseReport } from "@/app/types";

const Dashboard = dynamic(() => import("@/app/components/Dashboard"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 rounded-full border-2 border-transparent border-t-[#58a6ff] animate-spin" />
    </div>
  ),
});

export default function Home() {
  const [data, setData] = useState<PulseReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = useCallback(async (username: string) => {
    setIsLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch("/api/pulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json.error || `Failed to fetch data (${res.status})`
        );
      }

      setData(json);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSuggestion = (username: string) => {
    handleSearch(username);
  };

  return (
    <main className="min-h-screen bg-[#09090b]">
      {/* Hero */}
      <div className="pt-20 pb-12 px-4">
        <div className="text-center mb-10">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
            <span className="text-[#e2e8f0]">git</span>
            <span className="text-[#58a6ff]">pulse</span>
          </h1>
          <p className="text-[#64748b] text-lg mt-3 font-[family-name:var(--font-inter)]">
            Developer Intelligence Dashboard
          </p>
        </div>

        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {/* Suggestions */}
        {!data && !isLoading && !error && (
          <div className="text-center mt-6 animate-fade-in">
            <span className="text-[#64748b] text-sm">Try: </span>
            {["Mansi2221", "torvalds", "gaearon"].map((name, i) => (
              <span key={name}>
                {i > 0 && <span className="text-[#334155] mx-1">/</span>}
                <button
                  onClick={() => handleSuggestion(name)}
                  className="text-[#58a6ff] text-sm hover:underline transition-colors cursor-pointer"
                >
                  {name}
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto mt-6 animate-fade-in">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 text-center">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center mt-16 animate-fade-in">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-[#1e293b]" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#58a6ff] animate-spin" />
            </div>
            <p className="text-[#64748b] text-sm mt-4 animate-pulse-slow">
              Analyzing GitHub profile...
            </p>
          </div>
        )}
      </div>

      {/* Dashboard */}
      {data && (
        <div className="animate-fade-in">
          <Dashboard data={data} />
        </div>
      )}
    </main>
  );
}
