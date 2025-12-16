import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/lib/auth'; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NeighborNotes: Authenticated Community Board",
  description: "Share local notes and community events securely.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* WRAP THE APP WITH AUTH PROVIDER */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}