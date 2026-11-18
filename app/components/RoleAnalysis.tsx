"use client";

import { useState, useMemo } from "react";
import type { PulseReport } from "@/app/types";

// ─── Role definitions ──────────────────────────────────────────────────────────

type RoleKey =
  | "fde"
  | "fullstack"
  | "ml"
  | "backend"
  | "aiLlm"
  | "devops";

interface RoleMeta {
  key: RoleKey;
  label: string;
  short: string;
}

const ROLES: RoleMeta[] = [
  { key: "fde",       label: "Forward Deployed Engineer", short: "FDE" },
  { key: "fullstack", label: "Full-Stack Engineer",        short: "Full-Stack" },
  { key: "ml",        label: "ML Engineer",               short: "ML" },
  { key: "backend",   label: "Backend Engineer",          short: "Backend" },
  { key: "devops",    label: "DevOps / Platform Engineer", short: "DevOps" },
  { key: "aiLlm",     label: "AI / LLM Engineer",         short: "AI/LLM" },
];

// ─── Suggested profiles ────────────────────────────────────────────────────────

interface SuggestedProfile {
  username: string;
  description: string;
}

const SUGGESTED_PROFILES: Record<RoleKey, SuggestedProfile[]> = {
  fde: [
    { username: "tiangolo",     description: "Creator of FastAPI — ships production Python APIs used by millions. The FDE gold standard for backend." },
    { username: "simonw",       description: "Built Datasette, sqlite-utils, llm CLI. Full-stack + AI + ships tools customers actually use." },
    { username: "swyx",         description: "AI Engineer at Smol.ai. Writes code, deploys AI, writes about it. FDE-style builder." },
    { username: "leeerob",      description: "VP of Product at Vercel. Next.js, full-stack deployment, production AI — study his repos." },
    { username: "atharvajoshi01", description: "ML + agent eval + quant. 14 OSS PRs to Microsoft, scikit-learn, FinRL. Strong FDE competitor." },
  ],
  fullstack: [
    { username: "gaearon",      description: "Dan Abramov — React core team. Deep frontend + server components expertise." },
    { username: "leeerob",      description: "Lee Robinson — Vercel VP. Next.js App Router, full-stack patterns, deployment." },
    { username: "shadcn",       description: "Creator of shadcn/ui. Component design, Tailwind, Next.js mastery." },
    { username: "tiangolo",     description: "FastAPI + SQLModel. Full-stack Python/JS with production APIs." },
    { username: "t3dotgg",      description: "Theo — T3 stack creator. TypeScript full-stack, tRPC, Prisma patterns." },
  ],
  ml: [
    { username: "karpathy",     description: "Andrej Karpathy — built neural nets from scratch, former Tesla AI lead." },
    { username: "lucidrains",   description: "Phil Wang — implements every new ML paper in PyTorch. Prolific." },
    { username: "fchollet",     description: "Francois Chollet — creator of Keras. Deep learning API design." },
    { username: "jph00",        description: "Jeremy Howard — fast.ai founder. Practical deep learning education." },
    { username: "labmlai",      description: "labml.ai — annotated ML paper implementations with training code." },
  ],
  backend: [
    { username: "tiangolo",     description: "FastAPI, SQLModel, Typer. The standard for modern Python backend." },
    { username: "tj",           description: "TJ Holowaychuk — Express.js creator, Go backends, legendary builder." },
    { username: "antirez",      description: "Salvatore Sanfilippo — Redis creator. Data structures, performance, simplicity." },
    { username: "zzzeek",       description: "Mike Bayer — SQLAlchemy creator. ORM design, database patterns." },
    { username: "miguelgrinberg", description: "Flask APIs, WebSockets, real-time backends. Great REST API patterns." },
  ],
  devops: [
    { username: "kelseyhightower", description: "Kelsey Hightower — Kubernetes evangelist, cloud-native pioneer." },
    { username: "jessfraz",     description: "Jess Frazelle — containers, Linux, security, platform engineering." },
    { username: "brikis98",     description: "Yevgeniy Brikman — Terraform Up & Running author, IaC expert." },
    { username: "nektos",       description: "nektos/act — run GitHub Actions locally. CI/CD tooling." },
    { username: "derailed",     description: "k9s creator — Kubernetes CLI dashboard. DevOps tooling." },
  ],
  aiLlm: [
    { username: "hwchase17",    description: "Harrison Chase — LangChain founder. Agent orchestration, tool use, RAG." },
    { username: "jerryjliu",    description: "Jerry Liu — LlamaIndex founder. RAG, document retrieval, indexing." },
    { username: "simonw",       description: "Simon Willison — llm CLI, embeddings, RAG pipelines. Practical AI tools." },
    { username: "jxnl",         description: "Jason Liu — Instructor library. Structured outputs, function calling, pydantic." },
    { username: "lgrammel",     description: "Lars Grammel — Vercel AI SDK. Streaming, tool calling, model routing." },
  ],
};

// ─── Signal detection helpers ─────────────────────────────────────────────────

function toLower(s: string | null | undefined): string {
  return (s ?? "").toLowerCase();
}

interface Signals {
  languages: string[];          // language names lowercase
  topicsAll: string[];          // all topics lowercase
  repoText: string;             // combined repo names + descriptions lowercase
  hasDocker: boolean;
  hasCICD: boolean;
  hasTests: boolean;
  hasFrontend: boolean;
  hasBackend: boolean;
  hasPython: boolean;
  hasTS: boolean;
  hasJS: boolean;
  hasMLLibs: boolean;
  hasLLMLibs: boolean;
  hasInfraTools: boolean;
  hasNotebooks: boolean;
  hasDeployConfigs: boolean;
  repoCount: number;
  starCount: number;
}

function extractSignals(report: PulseReport): Signals {
  const languages = Object.keys(report.languages).map((l) => l.toLowerCase());
  const topicsAll = report.topTopics.map((t) => t.toLowerCase());

  const repoText = report.repos
    .map((r) => `${r.name} ${r.description ?? ""} ${r.topics.join(" ")}`)
    .join(" ")
    .toLowerCase();

  const all = `${repoText} ${topicsAll.join(" ")}`;

  const hasDocker     = /docker|container|compose/.test(all);
  const hasCICD       = /github.action|ci\/cd|ci-cd|workflow|jenkins|circleci|travis/.test(all) ||
                        report.repos.some((r) => r.topics.some((t) => /ci|cd|pipeline/.test(t)));
  const hasTests      = /test|spec|jest|pytest|unittest|coverage/.test(all);
  const hasFrontend   = languages.some((l) => ["typescript","javascript","html","css","vue","svelte"].includes(l)) ||
                        /react|next\.?js|vue|svelte|tailwind|frontend|ui/.test(all);
  const hasBackend    = /fastapi|express|django|flask|rails|spring|gin|echo|fiber|api/.test(all) ||
                        languages.some((l) => ["python","go","rust","java","ruby","php"].includes(l));
  const hasPython     = languages.includes("python");
  const hasTS         = languages.includes("typescript");
  const hasJS         = languages.includes("javascript");
  const hasMLLibs     = /pytorch|tensorflow|sklearn|scikit.learn|keras|huggingface|transformers|xgboost|lightgbm|pandas|numpy|mlflow|wandb|kaggle/.test(all);
  const hasLLMLibs    = /langchain|llamaindex|openai|anthropic|llm|rag|vector.?db|pinecone|weaviate|chroma|faiss|agent|prompt/.test(all);
  const hasInfraTools = /terraform|ansible|kubernetes|k8s|helm|pulumi|aws|gcp|azure|cloud/.test(all);
  const hasNotebooks  = /notebook|\.ipynb|jupyter|colab/.test(all) || languages.includes("jupyter notebook");
  const hasDeployConfigs = hasDocker || hasCICD || /vercel|railway|render|fly\.io|heroku/.test(all);

  return {
    languages, topicsAll, repoText: all,
    hasDocker, hasCICD, hasTests, hasFrontend, hasBackend,
    hasPython, hasTS, hasJS, hasMLLibs, hasLLMLibs,
    hasInfraTools, hasNotebooks, hasDeployConfigs,
    repoCount: report.repos.length,
    starCount: report.totalStars,
  };
}

// ─── Scoring + analysis per role ──────────────────────────────────────────────

interface RoleAnalysisResult {
  score: number;
  strengths: string[];
  gaps: string[];
  actionPlan: string[];
}

function analyzeFDE(s: Signals): RoleAnalysisResult {
  let score = 0;
  const strengths: string[] = [];
  const gaps: string[] = [];

  if (s.hasPython)         { score += 15; strengths.push("Python skills — core FDE language"); }
  if (s.hasTS || s.hasJS)  { score += 15; strengths.push("JavaScript/TypeScript — customer-facing UIs"); }
  if (s.hasFrontend)       { score += 10; strengths.push("Frontend experience (React/Next.js)"); }
  if (s.hasBackend)        { score += 10; strengths.push("Backend API development"); }
  if (s.hasDocker)         { score += 10; strengths.push("Docker / containerization in repos"); }
  if (s.hasCICD)           { score += 8;  strengths.push("CI/CD pipeline experience"); }
  if (s.hasLLMLibs)        { score += 12; strengths.push("LLM/AI tooling (LangChain, OpenAI, etc.)"); }
  if (s.hasTests)          { score += 5;  strengths.push("Test coverage visible in repos"); }
  if (s.hasDeployConfigs)  { score += 5;  strengths.push("Deployment configs or cloud platforms"); }
  if (s.starCount > 50)    { score += 5;  strengths.push("Established reputation with community stars"); }
  if (s.repoCount > 10)    { score += 5;  strengths.push("Active public repo portfolio"); }

  if (!s.hasPython)        gaps.push("No Python detected — FDEs heavily use Python for integrations");
  if (!s.hasFrontend)      gaps.push("No frontend signals — FDEs build customer-facing UIs");
  if (!s.hasBackend)       gaps.push("Missing API/backend framework usage (FastAPI, Express)");
  if (!s.hasDocker)        gaps.push("No Docker usage — production deployments require containerization");
  if (!s.hasCICD)          gaps.push("No CI/CD pipelines — automation is expected at FDE companies");
  if (!s.hasLLMLibs)       gaps.push("No LLM/AI tooling — most FDE roles now require AI integration");
  if (!s.hasTests)         gaps.push("Test coverage not visible — production reliability matters");

  return {
    score: Math.min(score, 100),
    strengths,
    gaps,
    actionPlan: [
      "Add a Dockerfile and docker-compose.yml to your top 3 repos",
      "Build a full-stack project: React/Next.js frontend + FastAPI backend",
      "Integrate an LLM API (OpenAI or Anthropic) into at least one project",
      "Add GitHub Actions CI/CD to 2-3 repos with lint + test steps",
      "Write production-quality READMEs with setup, architecture, and demo GIFs",
      "Publish an npm package or PyPI library to show OSS contribution ability",
      "Add an end-to-end test suite (Playwright or Cypress) to a web project",
    ],
  };
}

function analyzeFullStack(s: Signals): RoleAnalysisResult {
  let score = 0;
  const strengths: string[] = [];
  const gaps: string[] = [];

  if (s.hasFrontend)       { score += 20; strengths.push("Frontend skills (React, Next.js, Vue, etc.)"); }
  if (s.hasBackend)        { score += 20; strengths.push("Backend API or server framework usage"); }
  if (s.hasTS)             { score += 15; strengths.push("TypeScript — industry standard for full-stack"); }
  if (s.hasPython)         { score += 10; strengths.push("Python for backend services"); }
  if (s.hasDocker)         { score += 8;  strengths.push("Docker deployment configs"); }
  if (s.hasCICD)           { score += 7;  strengths.push("CI/CD setup"); }
  if (s.hasTests)          { score += 10; strengths.push("Test coverage visible"); }
  if (s.hasDeployConfigs)  { score += 10; strengths.push("Deployment experience (Vercel, Railway, etc.)"); }

  if (!s.hasFrontend)      gaps.push("No frontend framework detected (React/Next.js/Vue)");
  if (!s.hasBackend)       gaps.push("No backend framework detected (Express, FastAPI, Django)");
  if (!s.hasTS)            gaps.push("TypeScript not visible — full-stack roles expect TS proficiency");
  if (!s.hasTests)         gaps.push("No test suites found — full-stack engineers own quality");
  if (!s.hasDeployConfigs) gaps.push("Missing deployment experience — ship something to production");

  return {
    score: Math.min(score, 100),
    strengths,
    gaps,
    actionPlan: [
      "Build a full CRUD app with Next.js App Router + tRPC or REST API",
      "Add TypeScript to any JavaScript repos that lack it",
      "Set up Prisma or Drizzle ORM in a project with real DB migrations",
      "Deploy a full-stack app end-to-end: Vercel frontend + Railway/Fly.io backend",
      "Add Vitest/Jest for unit tests and Playwright for E2E tests",
      "Implement auth (Clerk or NextAuth) in a project to show real-world complexity",
      "Create a reusable component library or design system in Storybook",
    ],
  };
}

function analyzeML(s: Signals): RoleAnalysisResult {
  let score = 0;
  const strengths: string[] = [];
  const gaps: string[] = [];

  if (s.hasPython)         { score += 20; strengths.push("Python — the ML ecosystem's primary language"); }
  if (s.hasMLLibs)         { score += 25; strengths.push("ML frameworks visible (PyTorch, sklearn, etc.)"); }
  if (s.hasNotebooks)      { score += 15; strengths.push("Jupyter notebooks for experimentation"); }
  if (s.hasLLMLibs)        { score += 10; strengths.push("LLM/transformer library usage"); }
  if (s.hasTests)          { score += 10; strengths.push("Testing or evaluation code present"); }
  if (s.starCount > 20)    { score += 10; strengths.push("Starred repos signal recognized ML work"); }
  if (/kaggle|competition/.test(s.repoText)) { score += 10; strengths.push("Kaggle/competition experience"); }

  if (!s.hasPython)        gaps.push("Python is mandatory for ML engineering — start here");
  if (!s.hasMLLibs)        gaps.push("No ML frameworks found (PyTorch, TensorFlow, sklearn)");
  if (!s.hasNotebooks)     gaps.push("No Jupyter notebooks — experiment tracking is core ML workflow");
  if (!s.hasLLMLibs)       gaps.push("No transformer or LLM libraries — modern ML often involves them");

  return {
    score: Math.min(score, 100),
    strengths,
    gaps,
    actionPlan: [
      "Complete a Kaggle competition and publish your notebook with write-up",
      "Implement a model training pipeline with MLflow or Weights & Biases logging",
      "Fine-tune a HuggingFace transformer model and push it to the Hub",
      "Add a model evaluation suite to at least one ML repo (accuracy, F1, etc.)",
      "Build a data preprocessing pipeline with pandas + feature engineering",
      "Write a blog post or README explaining your model's architecture decisions",
      "Contribute to a popular ML OSS project (HuggingFace, fast.ai, scikit-learn)",
    ],
  };
}

function analyzeBackend(s: Signals): RoleAnalysisResult {
  let score = 0;
  const strengths: string[] = [];
  const gaps: string[] = [];

  if (s.hasBackend)        { score += 25; strengths.push("Backend frameworks in use (FastAPI, Express, etc.)"); }
  if (s.hasPython)         { score += 10; strengths.push("Python for backend services"); }
  if (s.hasDocker)         { score += 15; strengths.push("Docker for containerized deployments"); }
  if (s.hasTests)          { score += 15; strengths.push("Tests present — backend quality matters"); }
  if (s.hasCICD)           { score += 10; strengths.push("CI/CD automation"); }
  if (/postgres|redis|mysql|mongodb|sqlite|database|db/.test(s.repoText)) {
    score += 15; strengths.push("Database experience visible (SQL/NoSQL)");
  }
  if (/cache|queue|kafka|rabbitmq|celery|worker/.test(s.repoText)) {
    score += 10; strengths.push("Caching or message queue patterns");
  }

  if (!s.hasBackend)       gaps.push("No server framework detected (FastAPI, Express, Django, Go gin)");
  if (!s.hasDocker)        gaps.push("No Docker — backend services are almost always containerized");
  if (!s.hasTests)         gaps.push("No test suites — backend engineers own reliability");
  if (!/postgres|redis|mysql|mongodb|sqlite/.test(s.repoText))
                           gaps.push("No database work visible — APIs need persistent storage");
  if (!s.hasCICD)          gaps.push("No CI/CD — automated testing pipelines are table stakes");

  return {
    score: Math.min(score, 100),
    strengths,
    gaps,
    actionPlan: [
      "Build a REST API with FastAPI or Express + PostgreSQL, deployed with Docker",
      "Add Redis caching layer to an existing API project",
      "Implement JWT auth and rate limiting in a backend service",
      "Write integration tests (pytest + httpx for FastAPI, or supertest for Express)",
      "Add GitHub Actions CI that runs your test suite on every PR",
      "Build an async background job system (Celery, BullMQ, or pg-boss)",
      "Document your API with OpenAPI/Swagger and versioning strategy",
    ],
  };
}

function analyzeDevOps(s: Signals): RoleAnalysisResult {
  let score = 0;
  const strengths: string[] = [];
  const gaps: string[] = [];

  if (s.hasDocker)         { score += 20; strengths.push("Docker / container experience"); }
  if (s.hasCICD)           { score += 20; strengths.push("CI/CD pipelines configured"); }
  if (s.hasInfraTools)     { score += 20; strengths.push("Infrastructure tools (Terraform, Kubernetes, cloud)"); }
  if (s.hasTests)          { score += 10; strengths.push("Automated testing in pipelines"); }
  if (/monitor|prometheus|grafana|datadog|sentry|observ/.test(s.repoText)) {
    score += 15; strengths.push("Monitoring/observability tooling");
  }
  if (/shell|bash|script|automation/.test(s.repoText) || s.languages.includes("shell")) {
    score += 15; strengths.push("Shell scripting and automation");
  }

  if (!s.hasDocker)        gaps.push("No Docker usage — containers are foundational to DevOps");
  if (!s.hasCICD)          gaps.push("No CI/CD pipelines — automation is the entire job");
  if (!s.hasInfraTools)    gaps.push("No IaC tools (Terraform, Pulumi) or Kubernetes configs");
  if (!/monitor|prometheus|grafana/.test(s.repoText))
                           gaps.push("No observability work — monitoring is essential for platform roles");

  return {
    score: Math.min(score, 100),
    strengths,
    gaps,
    actionPlan: [
      "Add Dockerfiles and multi-stage builds to your top 3 repos",
      "Write a GitHub Actions workflow that builds, tests, and deploys automatically",
      "Create a Terraform module to provision a small cloud resource (S3, Cloud Run, etc.)",
      "Set up a local Kubernetes cluster (minikube/kind) and deploy an app with Helm",
      "Add Prometheus metrics and a Grafana dashboard to a service",
      "Implement secret management with Vault or cloud-native secrets",
      "Write runbook documentation for your infrastructure projects",
    ],
  };
}

function analyzeAILLM(s: Signals): RoleAnalysisResult {
  let score = 0;
  const strengths: string[] = [];
  const gaps: string[] = [];

  if (s.hasLLMLibs)        { score += 25; strengths.push("LLM/AI libraries in use (LangChain, OpenAI, etc.)"); }
  if (s.hasPython)         { score += 15; strengths.push("Python — primary language for AI/LLM engineering"); }
  if (s.hasMLLibs)         { score += 10; strengths.push("ML foundations (PyTorch, transformers)"); }
  if (/rag|retrieval|vector|embed|chroma|pinecone|weaviate|faiss/.test(s.repoText)) {
    score += 15; strengths.push("RAG / vector search implementations");
  }
  if (/agent|tool.?call|function.?call|orchestrat/.test(s.repoText)) {
    score += 15; strengths.push("Agent or tool-calling patterns");
  }
  if (/eval|benchmark|evals|accuracy|hallucin/.test(s.repoText)) {
    score += 10; strengths.push("LLM evaluation or benchmarking work");
  }
  if (s.hasBackend)        { score += 10; strengths.push("API/backend to serve AI features"); }

  if (!s.hasLLMLibs)       gaps.push("No LLM library usage — integrate OpenAI, Anthropic, or HuggingFace");
  if (!s.hasPython)        gaps.push("Python is required for LLM engineering ecosystem");
  if (!/rag|vector|embed/.test(s.repoText))
                           gaps.push("No RAG pipeline — build a document Q&A system with a vector DB");
  if (!/agent|tool.?call/.test(s.repoText))
                           gaps.push("No agent projects — autonomous tool-calling is core AI engineering");
  if (!/eval|benchmark/.test(s.repoText))
                           gaps.push("No evaluation framework — LLM quality requires systematic evals");

  return {
    score: Math.min(score, 100),
    strengths,
    gaps,
    actionPlan: [
      "Build a RAG pipeline: ingest PDFs, chunk, embed, store in ChromaDB, query with LLM",
      "Create a multi-tool agent using LangChain or the Anthropic tools API",
      "Implement an LLM eval suite comparing GPT-4 vs Claude vs Llama on your use case",
      "Fine-tune or LoRA-adapt a small open-source model (Mistral, Llama) on a custom dataset",
      "Build a streaming chat interface backed by an LLM API with memory",
      "Add observability to your LLM calls with LangSmith or Helicone",
      "Contribute to or open-source a prompt library or evaluation dataset",
    ],
  };
}

function analyzeRole(role: RoleKey, report: PulseReport): RoleAnalysisResult {
  const signals = extractSignals(report);
  switch (role) {
    case "fde":       return analyzeFDE(signals);
    case "fullstack": return analyzeFullStack(signals);
    case "ml":        return analyzeML(signals);
    case "backend":   return analyzeBackend(signals);
    case "devops":    return analyzeDevOps(signals);
    case "aiLlm":     return analyzeAILLM(signals);
  }
}

// ─── Score ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 70 ? "#39d353" :
    score >= 50 ? "#f1e05a" :
    "#f78166";

  const label =
    score >= 70 ? "Strong Fit" :
    score >= 50 ? "Partial Fit" :
    "Low Fit";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-[140px] h-[140px]">
        <svg width="140" height="140" className="-rotate-90">
          <circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth="8"
          />
          <circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs text-[#64748b]">/ 100</span>
        </div>
      </div>
      <span
        className="text-xs font-semibold px-3 py-1 rounded-full"
        style={{ color, backgroundColor: color + "18", border: `1px solid ${color}40` }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Suggested profile card ───────────────────────────────────────────────────

function ProfileCard({ profile }: { profile: SuggestedProfile }) {
  return (
    <a
      href={`https://github.com/${profile.username}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-3 rounded-lg border border-[#1e293b] bg-[#09090b] hover:border-[#58a6ff]/40 transition-colors group"
    >
      <div className="w-9 h-9 rounded-full bg-[#1e293b] flex items-center justify-center shrink-0 overflow-hidden">
        <img
          src={`https://github.com/${profile.username}.png?size=36`}
          alt={profile.username}
          className="w-full h-full rounded-full"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
      <div className="min-w-0">
        <span className="text-[#58a6ff] text-sm font-medium group-hover:underline">
          @{profile.username}
        </span>
        <p className="text-[#64748b] text-xs mt-0.5 leading-relaxed">
          {profile.description}
        </p>
      </div>
    </a>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RoleAnalysis({ data }: { data: PulseReport }) {
  const [selectedRole, setSelectedRole] = useState<RoleKey | null>(null);

  const result = useMemo(
    () => (selectedRole ? analyzeRole(selectedRole, data) : null),
    [selectedRole, data]
  );

  const profiles = selectedRole ? SUGGESTED_PROFILES[selectedRole] : [];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-16">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#1e293b]" />
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#1e293b] bg-[#0d1117]">
          <svg className="w-4 h-4 text-[#58a6ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
          <span className="text-[#e2e8f0] text-sm font-semibold tracking-wide uppercase">Career Fit Analysis</span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#1e293b]" />
      </div>

      {/* Role selector pills */}
      <div className="bg-[#0d1117] border border-[#1e293b] rounded-xl p-5 mb-5">
        <p className="text-[#64748b] text-sm mb-4">
          Select a target role to see how <span className="text-[#e2e8f0] font-medium">@{data.user.login}</span>'s profile matches — with specific strengths, gaps, and an action plan.
        </p>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((role) => {
            const isSelected = selectedRole === role.key;
            return (
              <button
                key={role.key}
                onClick={() => setSelectedRole(isSelected ? null : role.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                  isSelected
                    ? "bg-[#58a6ff]/15 border-[#58a6ff] text-[#58a6ff]"
                    : "bg-[#09090b] border-[#1e293b] text-[#94a3b8] hover:border-[#58a6ff]/40 hover:text-[#e2e8f0]"
                }`}
              >
                {role.short}
                <span className="hidden sm:inline text-[#64748b] font-normal">
                  {isSelected ? "" : ` — ${role.label.split(" ").slice(role.short.split(" ").length).join(" ")}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results panel */}
      {result && selectedRole && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in fade-in duration-300">
          {/* Score + summary col */}
          <div className="flex flex-col gap-4">
            {/* Score card */}
            <div className="bg-[#0d1117] border border-[#1e293b] rounded-xl p-6 flex flex-col items-center gap-4">
              <h3 className="text-[#e2e8f0] font-semibold text-sm uppercase tracking-wider self-start">
                {ROLES.find((r) => r.key === selectedRole)?.label} Fit
              </h3>
              <div className="relative flex flex-col items-center">
                <ScoreRing score={result.score} />
              </div>
              <p className="text-[#64748b] text-xs text-center leading-relaxed mt-1">
                Based on languages, frameworks, topics, and project signals in public repos.
              </p>
            </div>

            {/* Suggested profiles */}
            <div className="bg-[#0d1117] border border-[#1e293b] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-[#1e293b]">
                <svg className="w-4 h-4 text-[#58a6ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <h3 className="text-[#e2e8f0] font-semibold text-sm uppercase tracking-wider">
                  Profiles to Follow
                </h3>
              </div>
              <div className="p-4 flex flex-col gap-2">
                {profiles.map((p) => (
                  <ProfileCard key={p.username} profile={p} />
                ))}
              </div>
            </div>
          </div>

          {/* Strengths + Gaps col */}
          <div className="flex flex-col gap-4">
            {/* Strengths */}
            <div className="bg-[#0d1117] border border-[#1e293b] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-[#1e293b]">
                <svg className="w-4 h-4 text-[#39d353]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-[#e2e8f0] font-semibold text-sm uppercase tracking-wider">What's Strong</h3>
              </div>
              <div className="p-5">
                {result.strengths.length === 0 ? (
                  <p className="text-[#64748b] text-sm">No strong signals detected for this role yet.</p>
                ) : (
                  <ul className="space-y-2.5">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <svg className="w-4 h-4 text-[#39d353] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[#94a3b8] leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Gaps */}
            <div className="bg-[#0d1117] border border-[#1e293b] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-[#1e293b]">
                <svg className="w-4 h-4 text-[#f1e05a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h3 className="text-[#e2e8f0] font-semibold text-sm uppercase tracking-wider">What's Missing</h3>
              </div>
              <div className="p-5">
                {result.gaps.length === 0 ? (
                  <p className="text-[#64748b] text-sm">No significant gaps detected — excellent profile!</p>
                ) : (
                  <ul className="space-y-2.5">
                    {result.gaps.map((g, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <svg className="w-4 h-4 text-[#f1e05a] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[#94a3b8] leading-relaxed">{g}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Action plan col */}
          <div className="bg-[#0d1117] border border-[#1e293b] rounded-xl overflow-hidden h-fit">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-[#1e293b]">
              <svg className="w-4 h-4 text-[#bc8cff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <h3 className="text-[#e2e8f0] font-semibold text-sm uppercase tracking-wider">Action Plan</h3>
            </div>
            <div className="p-5">
              <ol className="space-y-4">
                {result.actionPlan.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: "#bc8cff18",
                        border: "1px solid #bc8cff40",
                        color: "#bc8cff",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-[#94a3b8] text-sm leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
