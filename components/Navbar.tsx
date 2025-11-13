"use client";

import { useClerk, SignedIn, SignedOut } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
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
}

export default function Navbar({ user }: NavbarProps) {
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const isOnDashboard =
    pathname === "/dashboard" || pathname?.startsWith("/dashboard/");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

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

  const handleSignOut = () => {
    signOut(() => router.push("/sign-in"));
  };

  const userDetails = {
    fullName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
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
    email: user?.emailAddress || "",
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header
      className={`bg-[#ffffff] border-b border-default-200 sticky top-0 z-50 transition-shadow ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto w-full py-3 md:py-4 px-4 md:px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 z-10">
            <CloudUpload className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Droply</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-4 items-center">
            <SignedOut>
              <Link href="/sign-in">
                <button className="px-5 py-2 bg-indigo-600 text-white rounded-lg shadow-md shadow-indigo-300 hover:bg-indigo-700 transition">Sign In</button>
              </Link>
              <Link href="/sign-up">
                <button className="px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-400 transition">Sign Up</button>
              </Link>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center gap-4 relative">
                {!isOnDashboard && (
                  <Link href="/dashboard">
                    <button className="px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-400 transition">Dashboard</button>
                  </Link>
                )}

                {/* Dropdown */}
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-ghost btn-sm gap-2 flex items-center">
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
                    <span className="hidden sm:inline">{userDetails.displayName}</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mt-2"
                  >
                    <li>
                      <Link href="/dashboard?tab=profile">Profile</Link>
                    </li>
                    <li>
                      <Link href="/dashboard">My Files</Link>
                    </li>
                    <li>
                      <button className="text-danger px-3 mt-2" onClick={handleSignOut}>
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

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/20 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Mobile Menu */}
          <div
            ref={mobileMenuRef}
            className={`fixed top-0 right-0 bottom-0 w-[80%] overflow-y-auto overflow-x-hidden bg-white z-50 flex flex-col pt-20 px-6 shadow-xl transform transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            } md:hidden`}
          >
            <SignedOut>
              <div className="flex flex-col gap-4 items-center">
                <Link href="/sign-in">
                  <button className="px-5 py-2 bg-indigo-500 text-white font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-700 transition">Sign In</button>
                </Link>
                <Link href="/sign-up">
                  <button className="px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-400 transition">Sign Up</button>
                </Link>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3 py-4 border-b border-default-200">
                  <div className="avatar placeholder">
                    {user?.imageUrl ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <Image src={user.imageUrl} alt="User" width={40} height={40} />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                        {userDetails.initials}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{userDetails.displayName}</p>
                    <p className="text-sm text-default-500">{userDetails.email}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {!isOnDashboard && (
                    <Link
                      href="/dashboard"
                      className="flex justify-center px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-400 transition"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  <Link
                    href="/dashboard?tab=profile"
                    
                    className="flex justify-center px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-400 transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    className="px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-400 transition"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSignOut();
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}
