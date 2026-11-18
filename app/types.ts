export interface GitHubUser {
  login: string
  name: string | null
  avatar_url: string
  bio: string | null
  company: string | null
  location: string | null
  blog: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string
}

export interface RepoData {
  name: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
  size: number
  topics: string[]
  fork: boolean
  html_url: string
}

export interface ContributionDay {
  date: string
  contributionCount: number
}

export interface ContributionWeek {
  contributionDays: ContributionDay[]
}

export interface PulseReport {
  user: GitHubUser
  repos: RepoData[]
  languages: Record<string, number>
  totalStars: number
  totalForks: number
  topTopics: string[]
  contributionData: ContributionWeek[]
  totalContributions: number
  accountAgeDays: number
  avgRepoSize: number
  mostActiveDay: string
  codingStreak: number
  recentActivity: { date: string; count: number }[]
  hourlyActivity: number[][]
  eventTypes: Record<string, number>
}
