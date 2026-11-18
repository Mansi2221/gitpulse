"use client";

import { useState, useCallback } from "react";

interface SearchBarProps {
  onSearch: (username: string) => void;
  isLoading: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = username.trim();
      if (!trimmed) {
        setError("Please enter a GitHub username");
        return;
      }
      setError("");
      onSearch(trimmed);
    },
    [username, onSearch]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-[#64748b]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (error) setError("");
            }}
            placeholder="Enter GitHub username"
            className="w-full h-14 pl-12 pr-4 bg-[#0d1117] border border-[#1e293b] rounded-xl text-[#e2e8f0] placeholder-[#64748b] text-lg focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all duration-200 font-[family-name:var(--font-inter)]"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="h-14 px-8 bg-[#58a6ff] hover:bg-[#79b8ff] disabled:opacity-50 disabled:cursor-not-allowed text-[#09090b] font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 text-lg shrink-0"
        >
          {isLoading ? (
            <>
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Analyzing
            </>
          ) : (
            "Analyze"
          )}
        </button>
        <div className="relative group">
          <button
            type="button"
            disabled
            className="h-14 px-6 bg-[#0d1117] border border-[#1e293b] text-[#64748b] rounded-xl cursor-not-allowed transition-all duration-200 text-lg shrink-0"
          >
            Compare
          </button>
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-[#1e293b] text-[#e2e8f0] text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Coming soon
          </div>
        </div>
      </div>
      {error && (
        <p className="mt-3 text-red-400 text-sm text-center">{error}</p>
      )}
    </form>
  );
}
