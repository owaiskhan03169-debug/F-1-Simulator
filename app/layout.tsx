import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "F1 Race Command Center | IBM watsonx AI",
  description: "Ultra-premium AI-powered Formula 1 telemetry and race strategy system",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

// Made with Bob
