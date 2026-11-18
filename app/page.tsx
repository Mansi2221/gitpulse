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

const RoleAnalysis = dynamic(() => import("@/app/components/RoleAnalysis"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center py-10">
      <div className="w-8 h-8 rounded-full border-2 border-transparent border-t-[#58a6ff] animate-spin" />
    </div>
  ),
});

const CompareView = dynamic(() => import("@/app/components/CompareView"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 rounded-full border-2 border-transparent border-t-[#58a6ff] animate-spin" />
    </div>
  ),
});

async function fetchPulse(username: string): Promise<PulseReport> {
  const res = await fetch("/api/pulse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `Failed to fetch data (${res.status})`);
  return json;
}

export default function Home() {
  const [data, setData] = useState<PulseReport | null>(null);
  const [compareData, setCompareData] = useState<{ left: PulseReport; right: PulseReport } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = useCallback(async (username: string) => {
    setIsLoading(true);
    setError("");
    setData(null);
    setCompareData(null);
    try {
      setData(await fetchPulse(username));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCompare = useCallback(async (user1: string, user2: string) => {
    setIsLoading(true);
    setError("");
    setData(null);
    setCompareData(null);
    try {
      const [left, right] = await Promise.all([fetchPulse(user1), fetchPulse(user2)]);
      setCompareData({ left, right });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#09090b]">
      <div className="pt-20 pb-12 px-4">
        <div className="text-center mb-10">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
            <span className="text-[#e2e8f0]">git</span>
            <span className="text-[#58a6ff]">pulse</span>
          </h1>
          <p className="text-[#64748b] text-lg mt-3">Developer Intelligence Dashboard</p>
        </div>

        <SearchBar onSearch={handleSearch} onCompare={handleCompare} isLoading={isLoading} />

        {!data && !compareData && !isLoading && !error && (
          <div className="text-center mt-6">
            <span className="text-[#64748b] text-sm">Try: </span>
            {["Mansi2221", "torvalds", "gaearon"].map((name, i) => (
              <span key={name}>
                {i > 0 && <span className="text-[#334155] mx-1">/</span>}
                <button onClick={() => handleSearch(name)} className="text-[#58a6ff] text-sm hover:underline cursor-pointer">{name}</button>
              </span>
            ))}
            <span className="text-[#334155] mx-2">|</span>
            <span className="text-[#64748b] text-sm">Compare: </span>
            <button onClick={() => handleCompare("Mansi2221", "atharvajoshi01")} className="text-[#58a6ff] text-sm hover:underline cursor-pointer">
              Mansi2221 vs atharvajoshi01
            </button>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mt-6">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 text-center">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center mt-16">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-[#1e293b]" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#58a6ff] animate-spin" />
            </div>
            <p className="text-[#64748b] text-sm mt-4 animate-pulse-slow">Analyzing GitHub profiles...</p>
          </div>
        )}
      </div>

      {data && <Dashboard data={data} />}
      {data && <RoleAnalysis data={data} />}
      {compareData && <CompareView left={compareData.left} right={compareData.right} />}
    </main>
  );
}
