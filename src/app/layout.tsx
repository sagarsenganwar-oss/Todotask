import type { Metadata } from "next";
import "./globals.css";
import { TimezoneCookie } from "./timezone-cookie";

export const metadata: Metadata = {
  title: "Todotask",
  description: "A simple task app",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <TimezoneCookie />
        {children}
      </body>
    </html>
  );
}
