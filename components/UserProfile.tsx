"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Mail, User, LogOut, Shield, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function UserProfile() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="flex flex-col justify-center items-center p-12">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500">Loading your profile...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="max-w-md mx-auto border border-gray-600 bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="flex items-center gap-3 p-4">
          <User className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">User Profile</h2>
        </div>
        <div className="divider m-0" />
        <div className="text-center py-10 px-6">
          <div className="mb-6">
            <div className="h-24 w-24 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center text-xl font-bold text-gray-500">
              Guest
            </div>
            <p className="text-lg font-medium">Not Signed In</p>
            <p className="text-gray-500 mt-2">
              Please sign in to access your profile
            </p>
          </div>
          <button
            className="btn btn-primary flex items-center justify-center gap-2 px-8"
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
    <div className="max-w-md mx-auto border border-gray-200 bg-white shadow-sm rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <User className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">User Profile</h2>
      </div>
      <div className="divider m-0" />

      {/* Body */}
      <div className="py-6 px-6">
        <div className="flex flex-col items-center text-center mb-6">
          {user.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={fullName}
              className="mb-4 h-24 w-24 rounded-full object-cover"
              width={96}
              height={96}
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center mb-4 text-xl font-bold text-gray-500">
              {initials}
            </div>
          )}

          <h3 className="text-xl font-semibold">{fullName}</h3>

          {user.emailAddresses && user.emailAddresses.length > 0 && (
            <div className="flex items-center gap-2 mt-1 text-gray-500">
              <Mail className="h-4 w-4" />
              <span>{email}</span>
            </div>
          )}

          {userRole && (
            <span className="badge badge-primary mt-3">{userRole}</span>
          )}
        </div>

        <div className="divider my-4" />

        {/* Account info */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary/70" />
              <span className="font-medium">Account Status</span>
            </div>
            <span className="badge badge-success">Active</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary/70" />
              <span className="font-medium">Email Verification</span>
            </div>
            <span
              className={`badge ${
                user.emailAddresses?.[0]?.verification?.status === "verified"
                  ? "badge-success"
                  : "badge-warning"
              }`}
            >
              {user.emailAddresses?.[0]?.verification?.status === "verified"
                ? "Verified"
                : "Pending"}
            </span>
          </div>
        </div>
      </div>

      <div className="divider m-0" />

      {/* Footer */}
      <div className="flex justify-between p-4">
        <button className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-1.5 px-3.5 py-2 rounded-md text-md font-medium shadow-sm transition" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}


