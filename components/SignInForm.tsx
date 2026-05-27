"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(6, { message: "Password too short" }),
});

export default function SignInForm() {
  const router = useRouter();
  const { signIn, isLoaded } = useSignIn();
  const { isSignedIn } = useUser();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (isSignedIn) router.push("/dashboard");
  }, [isSignedIn, router]);

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    if (!isLoaded || !signIn) return;

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (result.status === "complete" && result.createdSessionId) {
        window.location.href = "/dashboard";
      } else {
        setAuthError("Sign in failed. Please check your credentials.");
      }
    } catch (error: unknown) {
      setAuthError(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="w-full max-w-md rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-7 transition hover:-translate-y-1
    "
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-white">Welcome back</h1>
        <p className="text-sm text-white/60 mt-1">
          Sign in to your Droply workspace
        </p>
      </div>

      {/* Error */}
      {authError && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="h-4 w-4" />
          {authError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label className="text-sm font-semibold text-white/60">Email</label>

          <div className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus-within:border-indigo-500/40 transition">
            <Mail className="h-4 w-4 text-white/40" />
            <input
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/30"
            />
          </div>

          {errors.email && (
            <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-semibold text-white/60">
            Password
          </label>

          <div className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus-within:border-indigo-500/40 transition">
            <Lock className="h-4 w-4 text-white/40" />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/30"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-white/40 hover:text-white/70 transition"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="text-xs text-red-400 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-2.5 rounded-xl font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition active:scale-[0.98] disabled:opacity-50"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-white/50 mt-6">
        Not signed up yet ?{" "}
        <Link
          href="/sign-up"
          className="text-indigo-400 hover:text-indigo-300 font-bold"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
