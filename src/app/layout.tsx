import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CallUs } from "@/components/layout/CallUs";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dukanzo | Come Into Digital",
  description: "Dukanzo offers professional, transparent, and affordable website development for Indian businesses. Choose your tier, configure features, and go digital.",
  openGraph: {
    title: "Dukanzo | Come Into Digital",
    description: "Professional website development tailored for your business.",
    url: "https://dukanzo.in",
    siteName: "Dukanzo",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className={`${inter.className} min-h-full flex flex-col`}>
        {children}
        <CallUs />
      </body>
    </html>
  );
}
