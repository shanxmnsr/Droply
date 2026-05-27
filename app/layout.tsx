import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import IKProvider from "@/components/IKProvider";
import ClientLayout from "@/components/ClientLayout";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Droply",
  description: "Modern cloud storage platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`
          ${inter.variable}
          font-sans
          antialiased
          bg-background
          text-white
          min-h-screen
          overflow-x-hidden
        `}
      >
        <div className="relative min-h-screen">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />

          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px] pointer-events-none" />

          <div className="relative z-10">
            <ClerkProvider
              publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
            >
              <IKProvider>
                <ClientLayout>{children}</ClientLayout>

                <Toaster
                  position="top-right"
                  toastOptions={{
                    style: {
                      background: "#18181b",
                      color: "#fff",
                      border: "1px solid #27272a",
                    },
                    success: {
                      iconTheme: {
                        primary: "#10B981",
                        secondary: "#fff",
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: "#EF4444",
                        secondary: "#fff",
                      },
                    },
                  }}
                />
              </IKProvider>
            </ClerkProvider>
          </div>
        </div>
      </body>
    </html>
  );
}
