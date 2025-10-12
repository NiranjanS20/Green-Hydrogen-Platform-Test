import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutClient from "@/components/LayoutClient";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Green Hydrogen Platform - Sustainable Energy Production",
  description: "Smart Process System for production, storage and transportation of Green Hydrogen using renewable energy sources",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen gradient-bg">
            <LayoutClient>{children}</LayoutClient>
          </div>
        </Providers>
      </body>
    </html>
  );
}