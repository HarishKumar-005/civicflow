import type { Metadata } from "next";
import { Nunito_Sans, Varela_Round, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const nunitoSans = Nunito_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const varelaRound = Varela_Round({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "CivicFlow — Community Intelligence Platform",
  description:
    "Turn scattered community reports into structured priorities. Match volunteers to the right tasks at the right place and time.",
  keywords: [
    "civic tech",
    "volunteer management",
    "community intelligence",
    "NGO operations",
    "need prioritization",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunitoSans.variable} ${varelaRound.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
