"use client";

import { useClerk, SignedIn, SignedOut } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import AppImage from "@/components/AppImage";
import { CloudUpload, ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SerializedUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  username?: string | null;
  emailAddress?: string | null;
}

interface NavbarProps {
  user?: SerializedUser | null;
  setActiveTab?: (tab: string) => void;
  initialTab?: string;
}

export default function Navbar({
  user,
  setActiveTab,
  initialTab,
}: NavbarProps) {
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [, setActiveTabState] = useState(initialTab || "files");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isOnDashboard =
    pathname === "/dashboard" || pathname?.startsWith("/dashboard/");

  const userDetails = {
    initials: user
      ? `${user.firstName || ""} ${user.lastName || ""}`
          .trim()
          .split(" ")
          .map((n) => n?.[0] || "")
          .join("")
          .toUpperCase() || "U"
      : "U",

    displayName: user
      ? user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || user.username || user.emailAddress || "User"
      : "User",
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen((p) => !p);

  const handleSignOut = () => {
    signOut(() => router.push("/sign-in"));
  };

  const switchTab = (tab: string, url: string) => {
    setActiveTabState(tab);
    setActiveTab?.(tab);
    router.replace(url);
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };

  // scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
  }, [isMobileMenuOpen]);

  return (
    <header
      className={`sticky top-4 z-50 mx-4 md:mx-6 px-3 transition-all duration-300 rounded-[50px] border border-border shadow-lg shadow-black/20
      relative 
      ${
        isScrolled
          ? "bg-background/60 backdrop-blur-xl"
          : "bg-background/30 backdrop-blur-md"
      }`}
    >
      {/* glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-sky-500/10 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex items-center justify-between py-4 px-4">
        {/* LOGO */}
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg">
            <CloudUpload className="h-5 w-5 text-white" />
          </div>

          <div className="leading-tight">
            <h1 className="text-white font-bold text-lg">Droply</h1>
            <p className="text-xs text-white/50">Cloud Storage</p>
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden md:flex items-center gap-4">
          <SignedOut>
            <button
              onClick={() => router.push("/sign-in")}
              className="px-4 py-2 rounded-xl border border-white/10 text-white hover:bg-white/5"
            >
              Sign In
            </button>

            <button
              onClick={() => router.push("/sign-up")}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500"
            >
              Sign Up
            </button>
          </SignedOut>

          <SignedIn>
            {!isOnDashboard && (
              <button
                onClick={() => switchTab("files", "/dashboard")}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500"
              >
                Dashboard
              </button>
            )}

            {/* PROFILE DROPDOWN */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setIsDropdownOpen((p) => !p)}
                className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-white/5"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                  {user?.imageUrl ? (
                    <AppImage
                      src={user.imageUrl}
                      width={32}
                      height={32}
                      alt="user"
                    />
                  ) : (
                    <div className="w-8 h-8 flex items-center justify-center text-xs text-white bg-zinc-800">
                      {userDetails.initials}
                    </div>
                  )}
                </div>

                <span className="text-white text-sm hidden sm:block">
                  {userDetails.displayName}
                </span>

                <ChevronDown className="h-4 w-4 text-white/60" />
              </button>

              {/* DROPDOWN MENU */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl overflow-hidden z-[99999]">
                  <button
                    onClick={() =>
                      switchTab("profile", "/dashboard?tab=profile")
                    }
                    className="w-full text-left px-4 py-2 text-white hover:bg-white/5"
                  >
                    Profile
                  </button>

                  <button
                    onClick={() => switchTab("files", "/dashboard")}
                    className="w-full text-left px-4 py-2 text-white hover:bg-white/5"
                  >
                    My Files
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </SignedIn>
        </div>

        {/* MOBILE BUTTONS */}
        <div className="md:hidden flex items-center gap-2">
          <SignedIn>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
              {user?.imageUrl ? (
                <AppImage
                  src={user.imageUrl}
                  width={32}
                  height={32}
                  alt="user"
                />
              ) : (
                <div className="w-8 h-8 flex items-center justify-center text-xs text-white bg-zinc-800">
                  {userDetails.initials}
                </div>
              )}
            </div>
          </SignedIn>

          <button onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? (
              <X className="text-white" />
            ) : (
              <Menu className="text-white" />
            )}
          </button>
        </div>
      </div>

      {/* BACKDROP */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* MOBILE MENU */}
      <div
        className={`fixed top-0 right-0 h-screen w-[78%] max-w-[320px] bg-zinc-950 border-l border-white/10 z-50 transform transition-transform duration-300 md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-white font-bold text-lg">Droply</h2>
            <p className="text-zinc-400 text-xs">Cloud Storage</p>
          </div>

          <button
            onClick={toggleMobileMenu}
            className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* MENU ITEMS */}
        <div className="p-5 space-y-3">
          <SignedOut>
            <button
              onClick={() => {
                toggleMobileMenu();
                router.push("/sign-in");
              }}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white"
            >
              Sign In
            </button>

            <button
              onClick={() => {
                toggleMobileMenu();
                router.push("/sign-up");
              }}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-medium"
            >
              Sign Up
            </button>
          </SignedOut>

          <SignedIn>
            <button
              onClick={() => {
                toggleMobileMenu();
                switchTab("files", "/dashboard");
              }}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white"
            >
              My Files
            </button>

            <button
              onClick={() => {
                toggleMobileMenu();
                switchTab("profile", "/dashboard?tab=profile");
              }}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white"
            >
              Profile
            </button>

            <button
              onClick={() => {
                toggleMobileMenu();
                handleSignOut();
              }}
              className="w-full py-3 rounded-xl bg-red-500/20 border border-red-500/20 text-red-300"
            >
              Sign Out
            </button>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
