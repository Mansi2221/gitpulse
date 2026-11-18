"use client";

import type { PulseReport } from "@/app/types";

interface CompareViewProps {
  left: PulseReport;
  right: PulseReport;
}

function StatCell({ label, left, right }: { label: string; left: number; right: number }) {
  const leftWins = left > right;
  const rightWins = right > left;
  const tied = left === right;
  return (
    <tr className="border-b border-[#1e293b]">
      <td className={`py-3 px-4 text-right text-lg font-semibold ${leftWins ? "text-[#39d353]" : tied ? "text-[#e2e8f0]" : "text-[#64748b]"}`}>
        {left.toLocaleString()}
        {leftWins && <span className="ml-2 text-xs text-[#39d353]">+</span>}
      </td>
      <td className="py-3 px-4 text-center text-sm text-[#64748b] whitespace-nowrap">{label}</td>
      <td className={`py-3 px-4 text-left text-lg font-semibold ${rightWins ? "text-[#39d353]" : tied ? "text-[#e2e8f0]" : "text-[#64748b]"}`}>
        {right.toLocaleString()}
        {rightWins && <span className="ml-2 text-xs text-[#39d353]">+</span>}
      </td>
    </tr>
  );
}

function LanguageBar({ languages, color }: { languages: Record<string, number>; color: string }) {
  const sorted = Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const total = sorted.reduce((s, [, c]) => s + c, 0) || 1;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {sorted.map(([lang, count]) => (
        <div key={lang} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="text-xs text-[#e2e8f0]">{lang}</span>
          <span className="text-xs text-[#64748b]">{Math.round((count / total) * 100)}%</span>
        </div>
      ))}
    </div>
  );
}

export default function CompareView({ left, right }: CompareViewProps) {
  const leftScore = Math.round(
    ((left.repos.length * 2) + (left.totalStars * 5) + (left.totalForks * 3) + (left.totalContributions * 1) + (left.codingStreak * 2) + (Object.keys(left.languages).length * 3)) / 5
  );
  const rightScore = Math.round(
    ((right.repos.length * 2) + (right.totalStars * 5) + (right.totalForks * 3) + (right.totalContributions * 1) + (right.codingStreak * 2) + (Object.keys(right.languages).length * 3)) / 5
  );

  return (
    <div className="max-w-5xl mx-auto px-4 pb-16">
      {/* Profile headers */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {[left, right].map((data, i) => (
          <div key={i} className="bg-[#0d1117] border border-[#1e293b] rounded-xl p-6 flex items-center gap-4">
            <img src={data.user.avatar_url} alt={data.user.login} className="w-16 h-16 rounded-full border-2 border-[#1e293b]" />
            <div>
              <h3 className="text-lg font-bold text-[#e2e8f0]">{data.user.name || data.user.login}</h3>
              <p className="text-sm text-[#64748b]">@{data.user.login}</p>
              {data.user.bio && <p className="text-xs text-[#64748b] mt-1 line-clamp-1">{data.user.bio}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Score comparison */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {[{ data: left, score: leftScore }, { data: right, score: rightScore }].map(({ data, score }, i) => (
          <div key={i} className={`bg-[#0d1117] border rounded-xl p-6 text-center ${
            score > (i === 0 ? rightScore : leftScore) ? "border-[#39d353]" : score === (i === 0 ? rightScore : leftScore) ? "border-[#1e293b]" : "border-[#1e293b]"
          }`}>
            <div className={`text-5xl font-bold ${score > (i === 0 ? rightScore : leftScore) ? "text-[#39d353]" : "text-[#e2e8f0]"}`}>
              {score}
            </div>
            <p className="text-sm text-[#64748b] mt-1">developer score</p>
            {score > (i === 0 ? rightScore : leftScore) && (
              <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-[#39d353]/10 text-[#39d353] border border-[#39d353]/20">Winner</span>
            )}
          </div>
        ))}
      </div>

      {/* Stats table */}
      <div className="bg-[#0d1117] border border-[#1e293b] rounded-xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-[#1e293b]">
          <h3 className="text-sm font-semibold text-[#e2e8f0] uppercase tracking-wider">Head to Head</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e293b]">
              <th className="py-3 px-4 text-right text-sm text-[#64748b] font-normal">@{left.user.login}</th>
              <th className="py-3 px-4 text-center text-sm text-[#64748b] font-normal">Metric</th>
              <th className="py-3 px-4 text-left text-sm text-[#64748b] font-normal">@{right.user.login}</th>
            </tr>
          </thead>
          <tbody>
            <StatCell label="Repositories" left={left.repos.length} right={right.repos.length} />
            <StatCell label="Total Stars" left={left.totalStars} right={right.totalStars} />
            <StatCell label="Total Forks" left={left.totalForks} right={right.totalForks} />
            <StatCell label="Followers" left={left.user.followers} right={right.user.followers} />
            <StatCell label="Recent Events" left={left.totalContributions} right={right.totalContributions} />
            <StatCell label="Coding Streak" left={left.codingStreak} right={right.codingStreak} />
            <StatCell label="Languages" left={Object.keys(left.languages).length} right={Object.keys(right.languages).length} />
            <StatCell label="Topics" left={left.topTopics.length} right={right.topTopics.length} />
          </tbody>
        </table>
      </div>

      {/* Languages comparison */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-[#0d1117] border border-[#1e293b] rounded-xl p-6">
          <h4 className="text-sm font-semibold text-[#64748b] uppercase tracking-wider mb-3">@{left.user.login} Languages</h4>
          <LanguageBar languages={left.languages} color="#58a6ff" />
        </div>
        <div className="bg-[#0d1117] border border-[#1e293b] rounded-xl p-6">
          <h4 className="text-sm font-semibold text-[#64748b] uppercase tracking-wider mb-3">@{right.user.login} Languages</h4>
          <LanguageBar languages={right.languages} color="#39d353" />
        </div>
      </div>

      {/* Top repos comparison */}
      <div className="grid grid-cols-2 gap-6">
        {[left, right].map((data, i) => (
          <div key={i} className="bg-[#0d1117] border border-[#1e293b] rounded-xl p-6">
            <h4 className="text-sm font-semibold text-[#64748b] uppercase tracking-wider mb-3">
              @{data.user.login} Top Repos
            </h4>
            <div className="space-y-3">
              {data.repos.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 5).map((repo) => (
                <div key={repo.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <a href={repo.html_url} target="_blank" className="text-sm text-[#58a6ff] hover:underline truncate">{repo.name}</a>
                    {repo.language && <span className="text-xs text-[#64748b] shrink-0">{repo.language}</span>}
                  </div>
                  <span className="text-xs text-[#e2e8f0] shrink-0 ml-2">
                    {repo.stargazers_count > 0 ? `${repo.stargazers_count} ★` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
