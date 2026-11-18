import { NextRequest, NextResponse } from "next/server";
import type { GitHubUser, RepoData, PulseReport, ContributionWeek } from "@/app/types";

const GITHUB_API = "https://api.github.com";

const headers: HeadersInit = {
  Accept: "application/vnd.github.v3+json",
  "User-Agent": "gitpulse-app",
};

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

interface GitHubEvent {
  type: string;
  created_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const sanitized = username.trim();

    // Fetch all three in parallel
    const [user, repos, events] = await Promise.all([
      fetchJSON<GitHubUser>(`${GITHUB_API}/users/${sanitized}`),
      fetchJSON<RepoData[]>(
        `${GITHUB_API}/users/${sanitized}/repos?per_page=100&sort=pushed&type=owner`
      ),
      fetchJSON<GitHubEvent[]>(
        `${GITHUB_API}/users/${sanitized}/events/public?per_page=100`
      ),
    ]);

    // Filter out forks
    const ownRepos = repos.filter((r) => !r.fork);

    // Language distribution
    const languages: Record<string, number> = {};
    for (const repo of ownRepos) {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    }

    // Total stars and forks
    const totalStars = ownRepos.reduce((s, r) => s + r.stargazers_count, 0);
    const totalForks = ownRepos.reduce((s, r) => s + r.forks_count, 0);

    // Top topics
    const topicCounts: Record<string, number> = {};
    for (const repo of ownRepos) {
      for (const topic of repo.topics || []) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    }
    const topTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([t]) => t);

    // Account age
    const createdDate = new Date(user.created_at);
    const now = new Date();
    const accountAgeDays = Math.floor(
      (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Average repo size
    const avgRepoSize =
      ownRepos.length > 0
        ? Math.round(
            ownRepos.reduce((s, r) => s + r.size, 0) / ownRepos.length
          )
        : 0;

    // Process events for activity data
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayCounts: Record<string, number> = {};
    const dateCounts: Record<string, number> = {};
    // 7 rows (days) x 24 cols (hours)
    const hourlyActivity: number[][] = Array.from({ length: 7 }, () =>
      Array(24).fill(0)
    );
    const eventTypes: Record<string, number> = {};

    for (const event of events) {
      const d = new Date(event.created_at);
      const dayOfWeek = d.getUTCDay();
      const hour = d.getUTCHours();
      const dayName = dayNames[dayOfWeek];
      const dateStr = d.toISOString().split("T")[0];

      dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
      dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
      hourlyActivity[dayOfWeek][hour] += 1;

      const typeName = event.type.replace("Event", "");
      eventTypes[typeName] = (eventTypes[typeName] || 0) + 1;
    }

    // Most active day of week
    const mostActiveDay =
      Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // Recent activity (last 90 days, by date)
    const last90: { date: string; count: number }[] = [];
    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      last90.push({ date: dateStr, count: dateCounts[dateStr] || 0 });
    }

    // Build contribution weeks from last 90 days for heatmap
    const contributionData: ContributionWeek[] = [];
    let currentWeek: { date: string; contributionCount: number }[] = [];
    for (const day of last90) {
      currentWeek.push({ date: day.date, contributionCount: day.count });
      if (currentWeek.length === 7) {
        contributionData.push({ contributionDays: currentWeek });
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      contributionData.push({ contributionDays: currentWeek });
    }

    // Coding streak (consecutive days with activity from most recent)
    let codingStreak = 0;
    for (let i = last90.length - 1; i >= 0; i--) {
      if (last90[i].count > 0) {
        codingStreak++;
      } else {
        break;
      }
    }

    const totalContributions = events.length;

    const report: PulseReport = {
      user,
      repos: ownRepos,
      languages,
      totalStars,
      totalForks,
      topTopics,
      contributionData,
      totalContributions,
      accountAgeDays,
      avgRepoSize,
      mostActiveDay,
      codingStreak,
      recentActivity: last90,
      hourlyActivity,
      eventTypes,
    };

    return NextResponse.json(report);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("404") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
