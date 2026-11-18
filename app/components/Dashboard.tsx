"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { PulseReport } from "@/app/types";

const LANG_COLORS: Record<string, string> = {
  Python: "#3572A5",
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  Ruby: "#701516",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
};

const HEATMAP_COLORS = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];

function getHeatmapColor(count: number, max: number): string {
  if (count === 0) return HEATMAP_COLORS[0];
  if (max === 0) return HEATMAP_COLORS[0];
  const ratio = count / max;
  if (ratio <= 0.25) return HEATMAP_COLORS[1];
  if (ratio <= 0.5) return HEATMAP_COLORS[2];
  if (ratio <= 0.75) return HEATMAP_COLORS[3];
  return HEATMAP_COLORS[4];
}

function relativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function Card({
  children,
  className = "",
  title,
  icon,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={`bg-[#0d1117] border border-[#1e293b] rounded-xl overflow-hidden transition-all duration-300 hover:border-[#30363d] ${className}`}
    >
      {title && (
        <div className="flex items-center gap-2 px-6 py-4 border-b border-[#1e293b]">
          {icon && <span className="text-[#58a6ff]">{icon}</span>}
          <h3 className="text-[#e2e8f0] font-semibold text-sm uppercase tracking-wider">
            {title}
          </h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

// --- Profile Header ---
function ProfileHeader({ data }: { data: PulseReport }) {
  const { user, totalStars, totalForks, accountAgeDays } = data;
  const years = Math.floor(accountAgeDays / 365);
  const stats = [
    { label: "Repositories", value: user.public_repos, color: "#58a6ff" },
    { label: "Stars Earned", value: totalStars, color: "#f1e05a" },
    { label: "Followers", value: user.followers, color: "#39d353" },
    { label: "Total Forks", value: totalForks, color: "#dea584" },
    {
      label: "Account Age",
      value: years > 0 ? `${years}y` : `${accountAgeDays}d`,
      color: "#bc8cff",
    },
  ];

  return (
    <Card>
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <img
          src={user.avatar_url}
          alt={user.login}
          className="w-20 h-20 rounded-full ring-2 ring-[#1e293b] shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[#e2e8f0]">
              {user.name || user.login}
            </h1>
            <a
              href={`https://github.com/${user.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#58a6ff] hover:underline font-mono text-sm"
            >
              @{user.login}
            </a>
          </div>
          {user.bio && (
            <p className="text-[#94a3b8] mt-1 text-sm leading-relaxed">
              {user.bio}
            </p>
          )}
          <div className="flex flex-wrap gap-4 mt-2 text-xs text-[#64748b]">
            {user.location && (
              <span className="flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {user.location}
              </span>
            )}
            {user.company && (
              <span className="flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                {user.company}
              </span>
            )}
            {user.blog && (
              <a
                href={
                  user.blog.startsWith("http")
                    ? user.blog
                    : `https://${user.blog}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-[#58a6ff] transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                {user.blog}
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#09090b] border border-[#1e293b] rounded-lg p-3 text-center"
          >
            <div
              className="text-2xl font-bold font-[family-name:var(--font-jetbrains-mono)]"
              style={{ color: stat.color }}
            >
              {typeof stat.value === "number"
                ? formatNumber(stat.value)
                : stat.value}
            </div>
            <div className="text-[#64748b] text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// --- Contribution Heatmap ---
function ContributionHeatmap({ data }: { data: PulseReport }) {
  const { weeks, maxCount, monthLabels } = useMemo(() => {
    const allDays = data.recentActivity;
    const max = Math.max(...allDays.map((d) => d.count), 1);

    // Build weeks (columns) of 7 days each
    const ws: { date: string; count: number }[][] = [];
    let week: { date: string; count: number }[] = [];

    // Pad the start so the first column starts on a Sunday
    const firstDate = new Date(allDays[0].date);
    const startDay = firstDate.getUTCDay();
    for (let i = 0; i < startDay; i++) {
      week.push({ date: "", count: -1 });
    }

    for (const day of allDays) {
      week.push(day);
      if (week.length === 7) {
        ws.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push({ date: "", count: -1 });
      ws.push(week);
    }

    // Month labels
    const months: { label: string; col: number }[] = [];
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    let lastMonth = -1;
    ws.forEach((w, i) => {
      for (const d of w) {
        if (d.date) {
          const m = new Date(d.date).getUTCMonth();
          if (m !== lastMonth) {
            months.push({ label: monthNames[m], col: i });
            lastMonth = m;
          }
          break;
        }
      }
    });

    return { weeks: ws, maxCount: max, monthLabels: months };
  }, [data.recentActivity]);

  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

  return (
    <Card
      title="Activity"
      icon={
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      }
    >
      <div className="overflow-x-auto">
        {/* Month labels */}
        <div className="flex ml-8 mb-1 gap-0">
          {monthLabels.map((m, i) => (
            <div
              key={i}
              className="text-[10px] text-[#64748b] absolute"
              style={{ marginLeft: `${m.col * 15}px` }}
            >
              {m.label}
            </div>
          ))}
        </div>
        <div className="flex mt-5">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] mr-2 shrink-0">
            {dayLabels.map((label, i) => (
              <div
                key={i}
                className="h-[13px] text-[10px] text-[#64748b] flex items-center justify-end w-6"
              >
                {label}
              </div>
            ))}
          </div>
          {/* Grid */}
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className="w-[13px] h-[13px] rounded-sm transition-colors"
                    style={{
                      backgroundColor:
                        day.count < 0
                          ? "transparent"
                          : getHeatmapColor(day.count, maxCount),
                    }}
                    title={
                      day.date
                        ? `${day.date}: ${day.count} event${day.count !== 1 ? "s" : ""}`
                        : ""
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 mt-3 justify-end">
          <span className="text-[10px] text-[#64748b] mr-1">Less</span>
          {HEATMAP_COLORS.map((color, i) => (
            <div
              key={i}
              className="w-[11px] h-[11px] rounded-sm"
              style={{ backgroundColor: color }}
            />
          ))}
          <span className="text-[10px] text-[#64748b] ml-1">More</span>
        </div>
      </div>
    </Card>
  );
}

// --- Language Distribution ---
function LanguageChart({ data }: { data: PulseReport }) {
  const chartData = useMemo(() => {
    return Object.entries(data.languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({
        name,
        count,
        fill: LANG_COLORS[name] || "#8b949e",
      }));
  }, [data.languages]);

  if (chartData.length === 0) {
    return (
      <Card title="Languages" icon={<span>{"</>"}</span>}>
        <p className="text-[#64748b] text-sm">No language data available</p>
      </Card>
    );
  }

  return (
    <Card
      title="Languages"
      icon={
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      }
    >
      <ResponsiveContainer width="100%" height={chartData.length * 36 + 10}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            width={90}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0d1117",
              border: "1px solid #1e293b",
              borderRadius: "8px",
              color: "#e2e8f0",
              fontSize: 12,
            }}
            formatter={(value) => [`${value} repos`, "Count"]}
            cursor={{ fill: "rgba(88, 166, 255, 0.05)" }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// --- Topic Cloud ---
function TopicCloud({ data }: { data: PulseReport }) {
  const topicColors = [
    "#58a6ff",
    "#39d353",
    "#bc8cff",
    "#f78166",
    "#3178c6",
    "#f1e05a",
    "#dea584",
    "#00ADD8",
  ];

  if (data.topTopics.length === 0) {
    return (
      <Card
        title="Topics"
        icon={
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
        }
      >
        <p className="text-[#64748b] text-sm">No topics found</p>
      </Card>
    );
  }

  return (
    <Card
      title="Topics"
      icon={
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      }
    >
      <div className="flex flex-wrap gap-2">
        {data.topTopics.map((topic, i) => (
          <span
            key={topic}
            className="px-3 py-1.5 rounded-full text-xs font-medium border transition-transform hover:scale-105"
            style={{
              borderColor: topicColors[i % topicColors.length] + "40",
              color: topicColors[i % topicColors.length],
              backgroundColor: topicColors[i % topicColors.length] + "10",
            }}
          >
            {topic}
          </span>
        ))}
      </div>
    </Card>
  );
}

// --- Repository Table ---
function RepoTable({ data }: { data: PulseReport }) {
  const topRepos = useMemo(() => {
    return [...data.repos]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 10);
  }, [data.repos]);

  return (
    <Card
      title="Top Repositories"
      icon={
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      }
    >
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#64748b] text-xs uppercase tracking-wider">
              <th className="text-left pb-3 font-medium">Repository</th>
              <th className="text-left pb-3 font-medium">Language</th>
              <th className="text-right pb-3 font-medium">Stars</th>
              <th className="text-right pb-3 font-medium">Forks</th>
              <th className="text-right pb-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]">
            {topRepos.map((repo) => (
              <tr
                key={repo.name}
                className="hover:bg-[#161b22] transition-colors"
              >
                <td className="py-3 pr-4">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#58a6ff] hover:underline font-medium"
                  >
                    {repo.name}
                  </a>
                  {repo.description && (
                    <p className="text-[#64748b] text-xs mt-0.5 truncate max-w-xs">
                      {repo.description}
                    </p>
                  )}
                </td>
                <td className="py-3 pr-4">
                  {repo.language ? (
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            LANG_COLORS[repo.language] || "#8b949e",
                        }}
                      />
                      <span className="text-[#94a3b8] text-xs">
                        {repo.language}
                      </span>
                    </span>
                  ) : (
                    <span className="text-[#64748b] text-xs">--</span>
                  )}
                </td>
                <td className="py-3 pr-4 text-right text-[#f1e05a] font-mono text-xs">
                  {repo.stargazers_count > 0
                    ? formatNumber(repo.stargazers_count)
                    : "--"}
                </td>
                <td className="py-3 pr-4 text-right text-[#94a3b8] font-mono text-xs">
                  {repo.forks_count > 0
                    ? formatNumber(repo.forks_count)
                    : "--"}
                </td>
                <td className="py-3 text-right text-[#64748b] text-xs whitespace-nowrap">
                  {relativeTime(repo.updated_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// --- Activity Timeline ---
function ActivityTimeline({ data }: { data: PulseReport }) {
  const chartData = useMemo(() => {
    return data.recentActivity.slice(-30).map((d) => ({
      date: new Date(d.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      count: d.count,
    }));
  }, [data.recentActivity]);

  return (
    <Card
      title="Activity Timeline (30 days)"
      icon={
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      }
    >
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#58a6ff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#58a6ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fill: "#64748b", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0d1117",
              border: "1px solid #1e293b",
              borderRadius: "8px",
              color: "#e2e8f0",
              fontSize: 12,
            }}
            formatter={(value) => [`${value} events`, "Activity"]}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#58a6ff"
            strokeWidth={2}
            fill="url(#activityGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

// --- Coding Patterns Heatmap ---
function CodingPatterns({ data }: { data: PulseReport }) {
  const { hourlyActivity } = data;
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const maxVal = Math.max(...hourlyActivity.flat(), 1);

  return (
    <Card
      title="Coding Patterns (UTC)"
      icon={
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      }
    >
      <div className="overflow-x-auto">
        {/* Hour labels */}
        <div className="flex ml-10 mb-1">
          {Array.from({ length: 24 }, (_, i) => (
            <div
              key={i}
              className="text-[9px] text-[#64748b] flex-1 text-center"
            >
              {i % 3 === 0 ? `${i}` : ""}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-[2px]">
          {dayLabels.map((day, dayIndex) => (
            <div key={day} className="flex items-center gap-[2px]">
              <span className="text-[10px] text-[#64748b] w-8 text-right mr-2 shrink-0">
                {day}
              </span>
              {hourlyActivity[dayIndex].map((count, hour) => (
                <div
                  key={hour}
                  className="flex-1 h-[18px] rounded-sm min-w-[12px] transition-colors"
                  style={{
                    backgroundColor: getHeatmapColor(count, maxVal),
                  }}
                  title={`${day} ${hour}:00 - ${count} event${count !== 1 ? "s" : ""}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// --- Event Breakdown Pie ---
function EventBreakdown({ data }: { data: PulseReport }) {
  const PIE_COLORS = [
    "#58a6ff",
    "#39d353",
    "#bc8cff",
    "#f78166",
    "#f1e05a",
    "#3178c6",
    "#dea584",
    "#00ADD8",
  ];

  const chartData = useMemo(() => {
    return Object.entries(data.eventTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [data.eventTypes]);

  if (chartData.length === 0) {
    return (
      <Card title="Event Breakdown">
        <p className="text-[#64748b] text-sm">No event data available</p>
      </Card>
    );
  }

  return (
    <Card
      title="Event Breakdown"
      icon={
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
          />
        </svg>
      }
    >
      <div className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={index}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#0d1117",
                border: "1px solid #1e293b",
                borderRadius: "8px",
                color: "#e2e8f0",
                fontSize: 12,
              }}
              formatter={(value) => [`${value} events`, "Count"]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-2">
          {chartData.map((entry, i) => (
            <div key={entry.name} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                }}
              />
              <span className="text-[#94a3b8] text-xs">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// --- Main Dashboard ---
export default function Dashboard({ data }: { data: PulseReport }) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-16 card-stagger">
      {/* Profile Header */}
      <ProfileHeader data={data} />

      {/* Contribution Heatmap */}
      <div className="mt-4">
        <ContributionHeatmap data={data} />
      </div>

      {/* Languages + Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <LanguageChart data={data} />
        <TopicCloud data={data} />
      </div>

      {/* Repository Table */}
      <div className="mt-4">
        <RepoTable data={data} />
      </div>

      {/* Activity Timeline */}
      <div className="mt-4">
        <ActivityTimeline data={data} />
      </div>

      {/* Coding Patterns + Event Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <CodingPatterns data={data} />
        <EventBreakdown data={data} />
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-[#64748b] text-xs">
        <p>
          Data sourced from public GitHub API. Event data limited to last 90
          days.
        </p>
      </div>
    </div>
  );
}
