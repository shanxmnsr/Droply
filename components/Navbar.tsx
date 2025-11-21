
"use client";

import { useClerk, SignedIn, SignedOut } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { CloudUpload, ChevronDown, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

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

export default function Navbar({ user, setActiveTab, initialTab }: NavbarProps) {
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTabState] = useState(initialTab || "files");
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const isOnDashboard =
    pathname === "/dashboard" || pathname?.startsWith("/dashboard/");

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleSignOut = () => {
    signOut(() => router.push("/sign-in"));
  };

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

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-menu-button="true"]')) {
          setIsMobileMenuOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  // Helper for switching tabs
  const switchTab = (tab: string, url: string) => {
    setActiveTabState(tab); 
    setActiveTab?.(tab);    
    router.replace(url);
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`bg-white border-b border-default-200 sticky top-0 z-50 transition-shadow ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto w-full py-3 md:py-4 px-4 md:px-6 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 z-10">
          <CloudUpload className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Droply</h1>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-4 items-center">
          <SignedOut>
            <button
              onClick={() => router.push("/sign-in")}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push("/sign-up")}
              className="px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md hover:bg-indigo-400 transition"
            >
              Sign Up
            </button>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-4 relative">
              {!isOnDashboard && (
                <button
                  onClick={() => switchTab("files", "/dashboard")}
                  className="px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md hover:bg-indigo-400 transition"
                >
                  Dashboard
                </button>
              )}

              {/* Dropdown */}
              <div className="dropdown dropdown-end">
                <label
                  tabIndex={0}
                  className="btn btn-ghost btn-sm gap-2 flex items-center"
                >
                  <div className="avatar placeholder">
                    {user?.imageUrl ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={user.imageUrl}
                          alt="User"
                          width={32}
                          height={32}
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                        {userDetails.initials}
                      </div>
                    )}
                  </div>
                  <span className="hidden sm:inline">{userDetails.displayName}</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mt-2"
                >
                  <li>
                    <button
                      className={`p-2 font-semibold hover:bg-gray-100 ${
                        activeTab === "profile" ? "bg-gray-200 rounded" : ""
                      }`}
                      onClick={() =>
                        switchTab("profile", "/dashboard?tab=profile")
                      }
                    >
                      Profile
                    </button>
                  </li>
                  <li>
                    <button
                      className={`p-2 font-semibold hover:bg-gray-100 ${
                        activeTab === "files" ? "bg-gray-200 rounded" : ""
                      }`}
                      onClick={() => switchTab("files", "/dashboard")}
                    >
                      My Files
                    </button>
                  </li>
                  <li>
                    <button
                      className="p-2 font-semibold hover:bg-gray-100"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </SignedIn>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <SignedIn>
            <div className="avatar placeholder">
              {user?.imageUrl ? (
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <Image src={user.imageUrl} alt="User" width={32} height={32} />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                  {userDetails.initials}
                </div>
              )}
            </div>
          </SignedIn>
          <button
            className="z-50 p-2"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            data-menu-button="true"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-default-700" />
            ) : (
              <Menu className="h-6 w-6 text-default-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          ref={mobileMenuRef}
          className={`fixed top-0 right-0 bottom-0 w-[80%] overflow-y-auto overflow-x-hidden bg-white z-50 flex flex-col pt-20 px-6 shadow-xl transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          } md:hidden`}
        >
          <SignedOut>
            <button
              onClick={() => router.push("/sign-in")}
              className="px-5 py-2 bg-indigo-500 text-white rounded-lg mb-2"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push("/sign-up")}
              className="px-5 py-2 bg-indigo-300 text-indigo-700 rounded-lg"
            >
              Sign Up
            </button>
          </SignedOut>

          <SignedIn>
            <button
              className={`px-5 py-2 rounded-lg mb-2 ${
                activeTab === "files"
                  ? "bg-gray-200 text-indigo-700"
                  : "bg-indigo-300 text-indigo-700 hover:bg-indigo-400"
              }`}
              onClick={() => switchTab("files", "/dashboard")}
            >
              My Files
            </button>
            <button
              className={`px-5 py-2 rounded-lg mb-2 ${
                activeTab === "profile"
                  ? "bg-gray-200 text-indigo-700"
                  : "bg-indigo-300 text-indigo-700 hover:bg-indigo-400"
              }`}
              onClick={() => switchTab("profile", "/dashboard?tab=profile")}
            >
              Profile
            </button>
            <button
              onClick={handleSignOut}
              className="px-5 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg"
            >
              Sign Out
            </button>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
