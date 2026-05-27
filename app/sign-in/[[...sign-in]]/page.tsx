"use client";

import SignInForm from "@/components/SignInForm";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden bg-default-50 text-white relative">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-[500px] h-[400px] bg-indigo-500/10 blur-2xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[200px] bg-sky-500/10 blur-3xl rounded-full" />
      </div>

      <SignInForm />
    </div>
  );
}
