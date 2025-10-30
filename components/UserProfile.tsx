"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Mail, User, LogOut, Shield, ArrowRight } from "lucide-react";

export default function UserProfile() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="flex flex-col justify-center items-center p-12">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-default-600">Loading your profile...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="max-w-md mx-auto border border-default-200 bg-default-50 shadow-sm hover:shadow-md transition-shadow rounded-lg">
        <div className="flex gap-3 p-4 items-center">
          <User className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">User Profile</h2>
        </div>

        <div className="border-t border-default-200" />

        <div className="text-center py-10 px-6">
          <div className="mb-6">
            <div className="h-24 w-24 rounded-full bg-default-200 mx-auto mb-4 flex items-center justify-center text-xl font-bold text-default-500">
              Guest
            </div>
            <p className="text-lg font-medium">Not Signed In</p>
            <p className="text-default-500 mt-2">Please sign in to access your profile</p>
          </div>

          <button
            className="btn btn-primary flex items-center justify-center gap-2 px-8 py-2 text-white rounded-md"
            onClick={() => router.push("/sign-in")}
          >
            Sign In <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const email = user.primaryEmailAddress?.emailAddress || "";
  const initials = fullName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();
  const userRole = user.publicMetadata.role as string | undefined;

  const handleSignOut = () => {
    signOut(() => {
      router.push("/");
    });
  };

  return (
    <div className="max-w-md mx-auto border border-default-200 bg-default-50 shadow-sm hover:shadow-md transition-shadow rounded-lg">
      <div className="flex gap-3 p-4 items-center">
        <User className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">User Profile</h2>
      </div>

      <div className="border-t border-default-200" />

      <div className="py-6 px-6">
        <div className="flex flex-col items-center text-center mb-6">
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={fullName}
              className="mb-4 h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-default-200 flex items-center justify-center mb-4 text-xl font-bold text-default-500">
              {initials}
            </div>
          )}

          <h3 className="text-xl font-semibold">{fullName}</h3>

          {user.emailAddresses && user.emailAddresses.length > 0 && (
            <div className="flex items-center gap-2 mt-1 text-default-500">
              <Mail className="h-4 w-4" />
              <span>{email}</span>
            </div>
          )}

          {userRole && (
            <div className="mt-3 inline-block bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full">
              {userRole}
            </div>
          )}
        </div>

        <div className="border-t border-default-200 my-4" />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary/70" />
              <span className="font-medium">Account Status</span>
            </div>
            <div className="inline-block bg-success/10 text-success text-sm font-medium px-3 py-1 rounded-full">
              Active
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary/70" />
              <span className="font-medium">Email Verification</span>
            </div>
            <div
              className={`inline-block text-sm font-medium px-3 py-1 rounded-full ${
                user.emailAddresses?.[0]?.verification?.status === "verified"
                  ? "bg-success/10 text-success"
                  : "bg-warning/10 text-warning"
              }`}
            >
              {user.emailAddresses?.[0]?.verification?.status === "verified"
                ? "Verified"
                : "Pending"}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-default-200" />

      <div className="flex justify-between p-4">
        <button
          className="btn btn-danger flex items-center gap-2"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}
