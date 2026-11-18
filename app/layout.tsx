import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "gitpulse — Developer Intelligence Dashboard",
  description: "Paste a GitHub username. Get instant developer analytics.",
  openGraph: {
    title: "gitpulse — Developer Intelligence Dashboard",
    description: "Paste a GitHub username. Get instant developer analytics.",
    url: "https://gitpulse.vercel.app",
    siteName: "gitpulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "gitpulse — Developer Intelligence Dashboard",
    description: "Paste a GitHub username. Get instant developer analytics.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#09090b] text-[#e2e8f0]">
        {children}
      </body>
    </html>
  );
}
