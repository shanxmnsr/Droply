import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import IKProvider from "@/components/IKProvider"; 
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Droply",
  description: "Secure cloud storage for your images, powered by ImageKit",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <IKProvider>
        <html lang="en" suppressHydrationWarning>
          <body className={`${inter.variable} antialiased bg-default-50 text-default-900`}>
            <ClientLayout>{children}</ClientLayout>
          </body>
        </html>
      </IKProvider>
    </ClerkProvider>
  );
}
