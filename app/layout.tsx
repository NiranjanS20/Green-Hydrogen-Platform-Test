import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import SideMenu from "@/components/SideMenu";
import LayoutClient from "@/components/LayoutClient";

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
        <div className="min-h-screen gradient-bg">
          <Navigation />
          <div className="flex">
            <SideMenu />
            <main className="flex-1 lg:ml-64">
              <LayoutClient>{children}</LayoutClient>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}