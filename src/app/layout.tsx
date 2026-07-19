import type { Metadata, Viewport } from "next";
import { Noto_Sans_TC, Fraunces } from "next/font/google";
import { Providers } from "@/components/Providers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_THEME, isThemeId } from "@/lib/themes";
import "./globals.css";

const body = Noto_Sans_TC({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "學分通｜畢業學分與課表規劃",
  description: "大學部、碩班、教育學程學分計算、學期規劃與成績平均",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  let theme = DEFAULT_THEME;
  if (session?.user?.id) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      select: { themeColor: true },
    });
    if (isThemeId(profile?.themeColor)) theme = profile.themeColor;
  }

  return (
    <html
      lang="zh-Hant"
      data-theme={theme}
      className={`${body.variable} ${display.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full antialiased">
        <Providers initialTheme={theme}>{children}</Providers>
      </body>
    </html>
  );
}
