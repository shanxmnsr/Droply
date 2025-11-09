import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { CloudUpload, Shield, Folder, Image as ImageIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-default-50">
      {/* Main content */}
      <main className="flex-1">
        {/* Hero section */}
        <section className="py-12 md:py-20 px-4 md:px-6">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Text content */}
              <div className="space-y-6 text-center lg:text-left">
                <div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-default-900 leading-tight">
                    Store your <span className="text-primary">Images</span> with
                    ease
                  </h1>
                  <p className="text-lg md:text-xl text-default-600">
                    Simple. Secure. Fast.
                  </p>
                </div>

                {/* Hero Buttons */}
                <div className="flex flex-wrap gap-4 pt-4 justify-center lg:justify-start">
                  <SignedOut>
                    <Link href="/sign-up">
                      <button className="px-5 py-2 bg-indigo-600 text-white rounded-lg shadow-md shadow-indigo-300 hover:bg-indigo-700 transition">
                        Get Started
                      </button>
                    </Link>
                    <Link href="/sign-in">
                      <button className="px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-400 transition">
                        Sign In
                      </button>
                    </Link>
                  </SignedOut>

                  <SignedIn>
                    <Link href="/dashboard">
                      <button className="px-5 py-3 bg-indigo-600 text-white rounded-lg shadow-md shadow-indigo-300 hover:bg-indigo-700 transition">
                        Go to Dashboard
                      </button>
                    </Link>
                  </SignedIn>
                </div>
              </div>

              {/* Hero Image */}
              <div className="flex justify-center lg:order-last">
                <div className="relative w-64 h-64 md:w-80 md:h-80">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl"></div>
                  <ImageIcon className="h-40 md:h-32 w-24 md:w-32 text-primary/70 relative " />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="py-12 md:py-16 md:px-6 bg-default-50">
          <div className="container mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-5xl font-bold mb-4 text-default-900">
                What You Get
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {/* Quick Uploads */}
              <div className="card border border-default-200 bg-default-50 shadow-sm hover:shadow-lg transition-shadow p-6 text-center">
                <CloudUpload className="h-10 md:h-12 w-10 md:w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg md:text-xl font-semibold mb-2 text-default-900">
                  Quick Uploads
                </h3>
                <p className="text-default-600">Drag, drop, done.</p>
              </div>

              {/* Smart Organization */}
              <div className="card border border-default-200 bg-default-50 shadow-sm hover:shadow-lg transition-shadow p-6 text-center">
                <Folder className="h-10 md:h-12 w-10 md:w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg md:text-xl font-semibold mb-2 text-default-900">
                  Smart Organization
                </h3>
                <p className="text-default-600">Keep it tidy, find it fast.</p>
              </div>

              {/* Locked Down */}
              <div className="card border border-default-200 bg-default-50 shadow-sm hover:shadow-lg transition-shadow p-6 text-center sm:col-span-2 md:col-span-1 mx-auto sm:mx-0 max-w-md sm:max-w-full">
                <Shield className="h-10 md:h-12 w-10 md:w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg md:text-xl font-semibold mb-2 text-default-900">
                  Locked Down
                </h3>
                <p className="text-default-600">Your images, Your eyes only.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-12 md:py-20 px-4 md:px-6 bg-default-50">
          <div className="container mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-default-900">
              Ready?
            </h2>

            <SignedOut>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Link href="/sign-up">
                  <button className="px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-400 transition">
                    Let&apos;s Go
                  </button>
                </Link>
              </div>
            </SignedOut>

            <SignedIn>
              <Link href="/dashboard">
                <button className="px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-400 transition">
                  Dashboard
                </button>
              </Link>
            </SignedIn>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-default-50 border-t border-default-200 py-4 md:py-6">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <CloudUpload className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Droply</h2>
            </div>
            <p className="text-default-500 text-sm">
              &copy; {new Date().getFullYear()} Droply
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
