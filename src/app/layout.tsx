import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { EVDisclaimer } from "@/components/ev-disclaimer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EV Betting Agent",
  description:
    "Assistente pessoal de apostas por valor esperado. Calcula e recomenda — nunca executa.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-14 items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight">
                  EV Betting Agent
                </h1>
              </div>
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 container mx-auto px-4 py-6">
            <div className="mb-6">
              <EVDisclaimer />
            </div>
            {children}
          </main>

          <footer className="border-t py-4">
            <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
              Este sistema apenas calcula e recomenda. Nunca executa apostas.
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
