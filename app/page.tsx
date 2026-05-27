import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import {
  CloudUpload,
  Shield,
  Folder,
  Image as ImageIcon,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-default-50">
      {/* Background Glow */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-500/10 blur-3xl rounded-full" />
      </div>

      <main className="relative z-10">
        {/* HERO */}
        <section className="px-6 pt-24 pb-20">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            {/* LEFT */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl mb-6">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-white/70">
                  Modern Cloud Storage Platform
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                Store your{" "}
                <span className="bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">
                  Images
                </span>{" "}
                with ease
              </h1>

              <p className="mt-6 text-lg md:text-sm text-white/60 max-w-2xl">
                Fast, secure and beautifully organized cloud storage built for
                modern creators and teams.
              </p>

              {/* BUTTONS */}
              <div className="flex flex-wrap gap-4 pt-10 justify-center lg:justify-start">
                <SignedOut>
                  <Link href="/sign-up">
                    <button className="group px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                      Get Started
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>

                  <Link href="/sign-in">
                    <button className="px-6 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-xl transition-all duration-300">
                      Sign In
                    </button>
                  </Link>
                </SignedOut>

                <SignedIn>
                  <Link href="/dashboard">
                    <button className="group px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </SignedIn>
              </div>
            </div>

            {/* RIGHT */}
            <div className="relative flex justify-center">
              {/* Main Glass Card */}
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-sky-500/20 blur-3xl rounded-full" />

                <div className="relative rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 shadow-2xl">
                  <div>
                    {/* Glow */}
                    <div className="absolute top-0 left-0 w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full" />
                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-sky-500/20 blur-3xl rounded-full" />

                    {/* Floating Center Orb */}
                    <div className="relative flex justify-center items-center py-12">
                      <div className="absolute w-56 h-56 rounded-full bg-indigo-500/10 blur-3xl" />

                      <div className="relative w-32 h-32 rounded-[32px] bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shadow-[0_20px_80px_rgba(99,102,241,0.45)]">
                        <CloudUpload className="h-16 w-16 text-white" />
                      </div>

                      {/* Floating Folder */}
                      <div className="absolute top-8 left-0 md:left-6 rotate-[-12deg] rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl px-5 py-4 shadow-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                            <Folder className="h-5 w-5 text-indigo-400" />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-white">
                              Projects
                            </p>
                            <p className="text-xs text-white/40">24 files</p>
                          </div>
                        </div>
                      </div>

                      {/* Floating Image */}
                      <div className="absolute bottom-6 right-0 md:right-6 rotate-[10deg] rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl px-5 py-4 shadow-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-sky-400" />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-white">
                              Images
                            </p>
                            <p className="text-xs text-white/40">128 assets</p>
                          </div>
                        </div>
                      </div>

                      {/* Floating Secure */}
                      <div className="absolute bottom-0 left-10 rotate-[-8deg] rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl px-5 py-4 shadow-xl hidden md:block">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-emerald-400" />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-white">
                              Secure Cloud
                            </p>
                            <p className="text-xs text-white/40">
                              Encrypted storage
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="relative px-6 py-28 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-24 left-[20%] w-56 h-56 bg-indigo-500/8 blur-[90px] rounded-full" />

            <div className="absolute bottom-10 right-[18%] w-56 h-56 bg-sky-500/8 blur-[90px] rounded-full" />
          </div>

          <div className="relative max-w-7xl mx-auto">
            {/* HEADING */}
            <div className="text-center mb-20">
              <span className="inline-flex items-center px-4 py-1 rounded-full border border-white/10 bg-white/[0.03] text-sm text-indigo-300 backdrop-blur-xl mb-6">
                Powerful Features
              </span>

              <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
                Everything You Need
              </h2>

              <p className="mt-5 text-white/60 text-sm max-w-2xl mx-auto leading-relaxed">
                Built for speed, simplicity and security with a premium cloud
                experience.
              </p>
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* CARD 1 */}
              <div className="group relative">
                <div className="absolute -inset-[1px] rounded-[30px] bg-gradient-to-b from-indigo-500/20 to-transparent opacity-60 blur-sm group-hover:opacity-100 transition duration-100" />

                <div className="relative h-full rounded-[30px] border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] backdrop-blur-2xl p-8 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(99,102,241,0.18)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_55%)]" />

                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-2xl rounded-full" />

                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center mb-7 shadow-lg shadow-indigo-500/10">
                      <CloudUpload className="h-8 w-8 text-indigo-400" />
                    </div>

                    <h3 className="text-3xl font-bold mb-4">Quick Uploads</h3>

                    <p className="text-white/60 leading-relaxed text-[14px]">
                      Drag, drop and upload your files instantly with blazing
                      fast cloud performance.
                    </p>
                  </div>
                </div>
              </div>

              {/* CARD 2 */}
              <div className="group relative">
                <div className="absolute -inset-[1px] rounded-[30px] bg-gradient-to-b from-sky-500/20 to-transparent opacity-60 blur-sm group-hover:opacity-100 transition duration-100" />

                <div className="relative h-full rounded-[30px] border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] backdrop-blur-2xl p-8 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(14,165,233,0.18)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_55%)]" />

                  <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 blur-2xl rounded-full" />

                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center mb-7 shadow-lg shadow-sky-500/10">
                      <Folder className="h-8 w-8 text-sky-400" />
                    </div>

                    <h3 className="text-3xl font-bold mb-4">
                      Smart Organization
                    </h3>

                    <p className="text-white/60 leading-relaxed text-[14px]">
                      Organize everything beautifully with folders and
                      lightning-fast search.
                    </p>
                  </div>
                </div>
              </div>

              {/* CARD 3 */}
              <div className="group relative">
                <div className="absolute -inset-[1px] rounded-[30px] bg-gradient-to-b from-emerald-500/20 to-transparent opacity-60 blur-sm group-hover:opacity-100 transition duration-500" />

                <div className="relative h-full rounded-[30px] border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] backdrop-blur-2xl p-8 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(16,185,129,0.18)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_55%)]" />

                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full" />

                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center mb-7 shadow-lg shadow-emerald-500/10">
                      <Shield className="h-8 w-8 text-emerald-400" />
                    </div>

                    <h3 className="text-3xl font-bold mb-4">
                      Enterprise Security
                    </h3>

                    <p className="text-white/60 leading-relaxed text-[14px]">
                      Your files stay protected with enterprise-grade encryption
                      and secure cloud infrastructure.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-28">
          <div className="max-w-5xl mx-auto">
            {/* CTA CARD */}
            <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-2xl p-10 md:p-16 text-center shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-10 -left-10 w-56 h-56 bg-indigo-500/10 blur-[90px] rounded-full" />
                <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-sky-500/10 blur-[90px] rounded-full" />
              </div>

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]" />

              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                  Ready to start ?
                </h2>

                <p className="text-white/60 text-md mb-10 max-w-xl mx-auto leading-relaxed">
                  Upload, organize and access your files from anywhere with a
                  modern cloud experience.
                </p>

                {/* BUTTONS */}
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <SignedOut>
                    <Link href="/sign-up">
                      <button className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 shadow-[0_10px_30px_rgba(99,102,241,0.25)] hover:shadow-[0_15px_40px_rgba(99,102,241,0.35)] hover:-translate-y-1">
                        Create Free Account
                      </button>
                    </Link>
                  </SignedOut>

                  <SignedIn>
                    <Link href="/dashboard">
                      <button className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 shadow-[0_10px_30px_rgba(99,102,241,0.25)] hover:shadow-[0_15px_40px_rgba(99,102,241,0.35)] hover:-translate-y-1">
                        Open Dashboard
                      </button>
                    </Link>
                  </SignedIn>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center">
              <CloudUpload className="h-5 w-5 text-white" />
            </div>

            <div>
              <h2 className="font-bold text-white">Droply</h2>
              <p className="text-xs text-white/40">Modern Cloud Storage</p>
            </div>
          </div>

          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} Droply. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
