import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import Head from "./head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DeepSeek - 探索未至之境",
  description: "DeepSeek是领先的AI大模型与应用提供商，致力于开发先进的语言模型和人工智能技术。",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <ProfileProvider>
                <SettingsProvider>
                  <Head />
                  {children}
                </SettingsProvider>
              </ProfileProvider>
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
