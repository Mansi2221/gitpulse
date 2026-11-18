"use client";

import type { PulseReport } from "@/app/types";

interface CompareViewProps {
  left: PulseReport;
  right: PulseReport;
}

// ── Scoring ──────────────────────────────────────────────────────────────────

interface CategoryScore {
  name: string;
  leftScore: number;
  rightScore: number;
  leftWins: boolean;
  rightWins: boolean;
  insight: string;
}

function computeCategories(left: PulseReport, right: PulseReport): CategoryScore[] {
  const categories: CategoryScore[] = [];

  // 1. Output (repos, project breadth)
  const lRepos = left.repos.length;
  const rRepos = right.repos.length;
  categories.push({
    name: "Project Output",
    leftScore: lRepos, rightScore: rRepos,
    leftWins: lRepos > rRepos, rightWins: rRepos > lRepos,
    insight: lRepos > rRepos
      ? `@${left.user.login} has ${lRepos - rRepos} more repositories. @${right.user.login} should publish more projects.`
      : rRepos > lRepos
      ? `@${right.user.login} has ${rRepos - lRepos} more repositories. @${left.user.login} should publish more projects.`
      : "Both have the same number of repositories.",
  });

  // 2. Community (stars + forks + followers)
  const lCommunity = left.totalStars * 3 + left.totalForks * 2 + left.user.followers;
  const rCommunity = right.totalStars * 3 + right.totalForks * 2 + right.user.followers;
  const communityWinner = lCommunity > rCommunity ? left : right;
  const communityLoser = lCommunity > rCommunity ? right : left;
  categories.push({
    name: "Community Impact",
    leftScore: lCommunity, rightScore: rCommunity,
    leftWins: lCommunity > rCommunity, rightWins: rCommunity > lCommunity,
    insight: lCommunity === rCommunity ? "Both have similar community impact." :
      `@${communityWinner.user.login} has stronger community traction (${communityWinner.totalStars} stars, ${communityWinner.user.followers} followers). @${communityLoser.user.login} should share projects publicly to gain stars and followers.`,
  });

  // 3. Activity (recent events, coding streak)
  const lActivity = left.totalContributions * 2 + left.codingStreak * 5;
  const rActivity = right.totalContributions * 2 + right.codingStreak * 5;
  const actWinner = lActivity > rActivity ? left : right;
  const actLoser = lActivity > rActivity ? right : left;
  categories.push({
    name: "Recent Activity",
    leftScore: lActivity, rightScore: rActivity,
    leftWins: lActivity > rActivity, rightWins: rActivity > lActivity,
    insight: lActivity === rActivity ? "Both are equally active recently." :
      `@${actWinner.user.login} is more active recently (${actWinner.totalContributions} events, ${actWinner.codingStreak}-day streak). @${actLoser.user.login} should commit more consistently to build momentum.`,
  });

  // 4. Tech Breadth (languages, topics)
  const lBreadth = Object.keys(left.languages).length * 2 + left.topTopics.length;
  const rBreadth = Object.keys(right.languages).length * 2 + right.topTopics.length;
  const breadthWinner = lBreadth > rBreadth ? left : right;
  const breadthLoser = lBreadth > rBreadth ? right : left;
  categories.push({
    name: "Tech Breadth",
    leftScore: lBreadth, rightScore: rBreadth,
    leftWins: lBreadth > rBreadth, rightWins: rBreadth > lBreadth,
    insight: lBreadth === rBreadth ? "Both have similar tech breadth." :
      `@${breadthWinner.user.login} works across more languages and topics (${Object.keys(breadthWinner.languages).length} languages). @${breadthLoser.user.login} should diversify by contributing to projects in other languages.`,
  });

  // 5. Repo Quality (avg stars per repo, descriptions, topics per repo)
  const lQuality = left.repos.length > 0 ? (left.totalStars / left.repos.length) * 10 + left.topTopics.length : 0;
  const rQuality = right.repos.length > 0 ? (right.totalStars / right.repos.length) * 10 + right.topTopics.length : 0;
  const qualWinner = lQuality > rQuality ? left : right;
  const qualLoser = lQuality > rQuality ? right : left;
  categories.push({
    name: "Repo Quality",
    leftScore: Math.round(lQuality), rightScore: Math.round(rQuality),
    leftWins: lQuality > rQuality, rightWins: rQuality > lQuality,
    insight: Math.abs(lQuality - rQuality) < 1 ? "Both have similar repo quality." :
      `@${qualWinner.user.login} has higher quality repos. @${qualLoser.user.login} should add topics, descriptions, and READMEs to improve repo discoverability.`,
  });

  return categories;
}

function computeOverallScore(categories: CategoryScore[], side: "left" | "right"): number {
  let wins = 0;
  for (const c of categories) {
    if (side === "left" && c.leftWins) wins++;
    if (side === "right" && c.rightWins) wins++;
  }
  return Math.round((wins / categories.length) * 100);
}

function generateRecommendations(data: PulseReport, opponentData: PulseReport): string[] {
  const recs: string[] = [];
  if (data.totalStars < opponentData.totalStars) recs.push("Share your projects on Reddit, Twitter, and dev communities to earn stars.");
  if (data.user.followers < opponentData.user.followers) recs.push("Engage with the community — review PRs, file issues, comment on discussions.");
  if (data.totalContributions < opponentData.totalContributions) recs.push("Commit code daily. Even small updates keep your contribution graph green.");
  if (data.repos.length < opponentData.repos.length) recs.push("Publish more projects. Even small tools and utilities count.");
  if (Object.keys(data.languages).length < Object.keys(opponentData.languages).length) recs.push("Diversify your tech stack. Try contributing to projects in a new language.");
  if (data.codingStreak < opponentData.codingStreak) recs.push("Build a coding streak. Consistent daily commits show discipline.");
  if (data.topTopics.length < opponentData.topTopics.length) recs.push("Add topics to your repositories for better discoverability.");
  if (recs.length === 0) recs.push("Strong profile! Keep shipping and contributing to open source.");
  return recs;
}

// ── Components ───────────────────────────────────────────────────────────────

function StatCell({ label, left, right }: { label: string; left: number; right: number }) {
  const leftWins = left > right;
  const rightWins = right > left;
  const tied = left === right;
  return (
    <tr className="border-b border-[#1e293b]">
      <td className={`py-3 px-4 text-right text-lg font-semibold ${leftWins ? "text-[#39d353]" : tied ? "text-[#e2e8f0]" : "text-[#64748b]"}`}>
        {left.toLocaleString()}
        {leftWins && <span className="ml-2 text-xs text-[#39d353]">W</span>}
      </td>
      <td className="py-3 px-4 text-center text-sm text-[#64748b] whitespace-nowrap">{label}</td>
      <td className={`py-3 px-4 text-left text-lg font-semibold ${rightWins ? "text-[#39d353]" : tied ? "text-[#e2e8f0]" : "text-[#64748b]"}`}>
        {right.toLocaleString()}
        {rightWins && <span className="ml-2 text-xs text-[#39d353]">W</span>}
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

// ── Main Component ───────────────────────────────────────────────────────────

export default function CompareView({ left, right }: CompareViewProps) {
  const categories = computeCategories(left, right);
  const leftOverall = computeOverallScore(categories, "left");
  const rightOverall = computeOverallScore(categories, "right");
  const leftWinsOverall = leftOverall > rightOverall;
  const rightWinsOverall = rightOverall > leftOverall;
  const leftRecs = generateRecommendations(left, right);
  const rightRecs = generateRecommendations(right, left);

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

      {/* Overall Score */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {[{ score: leftOverall, wins: leftWinsOverall, login: left.user.login }, { score: rightOverall, wins: rightWinsOverall, login: right.user.login }].map(({ score, wins, login }, i) => (
          <div key={i} className={`bg-[#0d1117] border rounded-xl p-6 text-center ${wins ? "border-[#39d353]" : "border-[#1e293b]"}`}>
            <div className={`text-5xl font-bold ${wins ? "text-[#39d353]" : "text-[#e2e8f0]"}`}>{score}%</div>
            <p className="text-sm text-[#64748b] mt-1">categories won</p>
            {wins && <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-[#39d353]/10 text-[#39d353] border border-[#39d353]/20">Winner</span>}
            {!wins && leftOverall === rightOverall && <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-[#eab308]/10 text-[#eab308] border border-[#eab308]/20">Tied</span>}
          </div>
        ))}
      </div>

      {/* Category Breakdown */}
      <div className="bg-[#0d1117] border border-[#1e293b] rounded-xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-[#1e293b]">
          <h3 className="text-sm font-semibold text-[#e2e8f0] uppercase tracking-wider">Category Breakdown</h3>
        </div>
        <div className="divide-y divide-[#1e293b]">
          {categories.map((cat) => (
            <div key={cat.name} className="px-6 py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#e2e8f0]">{cat.name}</span>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-mono ${cat.leftWins ? "text-[#39d353]" : "text-[#64748b]"}`}>
                    {cat.leftWins ? "W" : cat.rightWins ? "L" : "-"} @{left.user.login}
                  </span>
                  <span className="text-[#334155]">vs</span>
                  <span className={`text-sm font-mono ${cat.rightWins ? "text-[#39d353]" : "text-[#64748b]"}`}>
                    @{right.user.login} {cat.rightWins ? "W" : cat.leftWins ? "L" : "-"}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#64748b]">{cat.insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Head to Head Stats */}
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

      {/* Recommendations */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {[{ data: left, recs: leftRecs, opponent: right }, { data: right, recs: rightRecs, opponent: left }].map(({ data, recs }, i) => (
          <div key={i} className="bg-[#0d1117] border border-[#1e293b] rounded-xl p-6">
            <h4 className="text-sm font-semibold text-[#e2e8f0] uppercase tracking-wider mb-4">
              How @{data.user.login} can improve
            </h4>
            <div className="space-y-3">
              {recs.map((rec, j) => (
                <div key={j} className="flex gap-3">
                  <span className="text-[#58a6ff] mt-0.5 shrink-0">-&gt;</span>
                  <p className="text-sm text-[#94a3b8]">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Languages + Top Repos */}
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

      <div className="grid grid-cols-2 gap-6">
        {[left, right].map((data, i) => (
          <div key={i} className="bg-[#0d1117] border border-[#1e293b] rounded-xl p-6">
            <h4 className="text-sm font-semibold text-[#64748b] uppercase tracking-wider mb-3">@{data.user.login} Top Repos</h4>
            <div className="space-y-3">
              {[...data.repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 5).map((repo) => (
                <div key={repo.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <a href={repo.html_url} target="_blank" className="text-sm text-[#58a6ff] hover:underline truncate">{repo.name}</a>
                    {repo.language && <span className="text-xs text-[#64748b] shrink-0">{repo.language}</span>}
                  </div>
                  <span className="text-xs text-[#e2e8f0] shrink-0 ml-2">{repo.stargazers_count > 0 ? `${repo.stargazers_count} ★` : ""}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
