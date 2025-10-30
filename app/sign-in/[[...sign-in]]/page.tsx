"use client";

import Link from "next/link";
import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, isLoaded } = useSignIn();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    if (!isLoaded) return;
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });
      if (result.status === "complete") {
        router.push("/dashboard"); // Redirect after successful sign-in
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setAuthError(error.message || "Sign-in failed. Please try again.");
      } else if (typeof error === "object" && error && "errors" in error) {
        // if it's a Clerk or API-style error
        const errObj = error as { errors?: { message?: string }[] };
        setAuthError(
          errObj.errors?.[0]?.message || "Sign-in failed. Please try again."
        );
      } else {
        setAuthError("Sign-in failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card w-full max-w-md mx-auto border border-default-200 bg-default-50 shadow-xl p-6 mt-20">
      <h1 className="text-2xl font-bold text-center mb-2">Sign In</h1>
      {authError && (
        <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" /> {authError}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="form-control w-full">
          <label className="label">Email</label>
          <input
            type="email"
            placeholder="your.email@example.com"
            className="input input-bordered w-full"
            {...register("email")}
          />
          {errors.email && (
            <span className="text-danger text-sm">{errors.email.message}</span>
          )}
        </div>

        <div className="form-control w-full">
          <label className="label">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="input input-bordered w-full pr-10"
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-default-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <span className="text-danger text-sm">
              {errors.password.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="px-6 w-full py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="text-center text-sm text-default-600 mt-4">
        Don't have an account?{" "}
        <Link href="/sign-up" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
