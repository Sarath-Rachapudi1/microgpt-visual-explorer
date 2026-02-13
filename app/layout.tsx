import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Navbar } from "@/components/layout/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MicroGPT Visual Explorer",
  description: "An interactive educational tool that explains how GPT models work using simple language and visualizations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="microgpt-theme">
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
