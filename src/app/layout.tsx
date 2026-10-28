import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/providers/AppProviders";
import { getDefaultThemeCss, getThemeBootstrapScript } from "@/styles/themeScript";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants/app";
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
  title: {
    default: `${APP_NAME} | ${APP_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "TrenderAlert helps people discover rising trends early, understand why they matter and follow how they spread across places and communities.",
};

export const viewport: Viewport = {
  themeColor: "#111111",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      data-theme="trenderalert"
      data-mode="light"
      suppressHydrationWarning
    >
      <head>
        <style id="ta-theme-defaults" dangerouslySetInnerHTML={{ __html: getDefaultThemeCss() }} />
        <script
          id="ta-theme-bootstrap"
          dangerouslySetInnerHTML={{ __html: getThemeBootstrapScript() }}
        />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
