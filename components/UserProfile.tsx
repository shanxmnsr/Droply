"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Mail,
  User,
  LogOut,
  Shield,
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import AppImage from "@/components/AppImage";

export default function UserProfile() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        <p className="mt-4 text-sm text-zinc-500">Loading profile...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.25)] transition hover:-translate-y-1 hover:shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <User className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">User Profile</h2>
        </div>

        <div className="py-10 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-zinc-400">
            Guest
          </div>

          <p className="text-lg font-semibold text-white">Not signed in</p>
          <p className="mt-1 text-sm text-white/50">
            Sign in to access your files and dashboard
          </p>

          <button
            onClick={() => router.push("/sign-in")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-white transition hover:bg-indigo-400 active:scale-95"
          >
            Sign In <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const fullName =
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "User";

  const email = user.primaryEmailAddress?.emailAddress ?? "";

  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  const userRole = user.publicMetadata?.role as string | undefined;

  const isVerified =
    user.emailAddresses?.[0]?.verification?.status === "verified";

  const handleSignOut = () => {
    signOut(() => router.push("/"));
  };

  return (
    <div className="mt-20 mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.25)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_140px_rgba(0,0,0,0.45)]">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/10 p-5">
        <User className="h-5 w-5 text-indigo-400" />
        <h2 className="text-lg font-semibold text-white">Profile</h2>
      </div>

      {/* Body */}
      <div className="flex flex-col items-center p-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full bg-indigo-500/30 blur-xl" />

          <div className="relative rounded-full p-[2px] bg-gradient-to-tr from-indigo-500 via-sky-400 to-indigo-500">
            {user.imageUrl ? (
              <AppImage
                src={user.imageUrl}
                alt={fullName}
                width={96}
                height={96}
                className="h-24 w-24 rounded-full object-cover border border-white/10"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-900 text-xl font-bold text-white">
                {initials}
              </div>
            )}
          </div>
        </div>

        <h3 className="mt-4 text-xl font-semibold text-white">{fullName}</h3>

        <div className="mt-1 flex items-center gap-2 text-sm text-white/50">
          <Mail className="h-4 w-4 shrink-0" />
          <span className="truncate">{email}</span>
        </div>

        {userRole && (
          <span className="mt-3 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            {userRole}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="space-y-3 px-6 pb-5">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm text-white">
            <Shield className="h-4 w-4 text-indigo-400" />
            Account Status
          </div>

          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </span>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm text-white">
            <Mail className="h-4 w-4 text-indigo-400" />
            Email Verification
          </div>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
              isVerified
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-amber-500/10 text-amber-400"
            }`}
          >
            {isVerified ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </>
            ) : (
              <>
                <Clock className="h-3 w-3" />
                Pending
              </>
            )}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end border-t border-white/10 p-5">
        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-red-400
          transition hover:bg-red-500/20 active:scale-95"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
